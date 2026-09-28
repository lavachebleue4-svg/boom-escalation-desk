import type {
  AppState,
  ClosureRecord,
  Debrief,
  EscalationCase,
  RoleName,
  Severity,
  UpdateChannel,
  VerificationRecord,
} from '../types';
import { MIN } from '../lib/time';
import { makeId } from '../lib/id';
import { mkEvent } from '../lib/timeline';
import { runMonitorScan } from './derive';
import { buildInitialState } from '../data/seed';

const HEALTH_CHECK_STALE_MS = 10 * MIN;

export type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'RESET_DEMO' }
  | {
      type: 'ACKNOWLEDGE_CASE';
      caseId: string;
      owner: RoleName;
      severity: Severity;
      nextClientUpdate: number;
      actor: RoleName;
    }
  | {
      type: 'SET_NEXT_ACTION';
      caseId: string;
      nextAction: string;
      nextActionOwner: RoleName;
      nextActionDeadline: number;
      reason?: string;
      actor: RoleName;
    }
  | { type: 'REQUEST_ENGINEERING'; caseId: string; issueRef: string; actor: RoleName }
  | {
      type: 'ENGINEERING_ACCEPT';
      caseId: string;
      technicalOwner: RoleName;
      actor: RoleName;
    }
  | {
      type: 'ENGINEERING_REQUEST_INFO';
      caseId: string;
      infoNeeded: string;
      infoRequestedFrom: string;
      infoDeadline: number;
      actor: RoleName;
    }
  | {
      type: 'ENGINEERING_REDIRECT';
      caseId: string;
      redirectDestination: string;
      redirectReason: string;
      newOwner: RoleName;
      actor: RoleName;
    }
  | {
      type: 'ADD_PARTNER';
      caseId: string;
      partnerName: string;
      caseRef: string;
      impactSent: string;
      internalOwner: RoleName;
      nextChase: number;
      actor: RoleName;
    }
  | {
      type: 'RECORD_PARTNER_CHASE';
      caseId: string;
      nextChase: number;
      note?: string;
      actor: RoleName;
    }
  | { type: 'RETURN_TECHNICAL_OUTCOME'; caseId: string; note?: string; actor: RoleName }
  | {
      type: 'VERIFY_CASE';
      caseId: string;
      result: VerificationRecord['result'];
      notes: string;
      remainingImpact?: string;
      followOwner?: RoleName;
      followDeadline?: number;
      newNextAction?: string;
      actor: RoleName;
    }
  | {
      type: 'CLOSE_CASE';
      caseId: string;
      resolutionSummary: string;
      verificationEvidence: string;
      finalClientComm: string;
      followUpTasks: string[];
      actor: RoleName;
    }
  | {
      type: 'RECORD_CLIENT_UPDATE';
      caseId: string;
      summary: string;
      channel: UpdateChannel;
      nextUpdateDue: number;
      actor: RoleName;
    }
  | {
      type: 'CHANGE_SEVERITY';
      caseId: string;
      newSeverity: Severity;
      reason: string;
      actor: RoleName;
    }
  | {
      type: 'CHANGE_DEADLINE';
      caseId: string;
      field: 'nextActionDeadline' | 'nextClientUpdate';
      newValue: number;
      reason: string;
      actor: RoleName;
    }
  | {
      type: 'REQUEST_HANDOVER';
      caseId: string;
      toOwner: RoleName;
      currentImpact: string;
      currentTechnicalStatus: string;
      currentDependency: string;
      nextAction: string;
      nextActionDeadline: number;
      nextClientUpdate: number;
      actor: RoleName;
    }
  | { type: 'ACCEPT_HANDOVER'; caseId: string; actor: RoleName }
  | {
      type: 'REQUEST_EXECUTIVE_DECISION';
      caseId: string;
      decisionRequired: string;
      whyInsufficient: string;
      businessImpact: string;
      actor: RoleName;
    }
  | { type: 'CREATE_DEBRIEF'; caseId: string; debrief: Omit<Debrief, 'createdAt'>; actor: RoleName }
  | { type: 'ACK_ALERT'; alertId: string }
  | { type: 'ADVANCE_TIME'; deltaMs: number }
  | { type: 'JUMP_TO_NEXT_CHECKPOINT' }
  | { type: 'SET_ROLE'; role: RoleName }
  | { type: 'TOGGLE_PRESENTATION_MODE' }
  | { type: 'GUIDED_DEMO_START' }
  | { type: 'GUIDED_DEMO_STEP'; step: number }
  | { type: 'GUIDED_DEMO_EXIT' }
  | { type: 'SIMULATE_AUTOMATION_FAILURE' }
  | { type: 'RESTORE_MONITOR' };

function updateCase(
  state: AppState,
  id: string,
  fn: (c: EscalationCase) => EscalationCase,
): AppState {
  const c = state.cases[id];
  if (!c) return state;
  return { ...state, cases: { ...state.cases, [id]: fn(c) } };
}

function applyTimeAdvance(state: AppState, newTime: number): AppState {
  let automation = { ...state.automation };
  let alerts = state.alerts;

  if (automation.monitorHealthy) {
    const scan = runMonitorScan(state, newTime);
    alerts = scan.alerts;
    automation.lastSuccessfulScan = newTime;
    automation.casesScanned = scan.casesScanned;
    if (scan.createdNew) automation.lastAlertCreated = newTime;
  }

  const staleness = newTime - (automation.lastSuccessfulScan ?? newTime);
  automation.healthCheckFailed = staleness >= HEALTH_CHECK_STALE_MS;
  automation.lastHealthCheck = newTime;

  return {
    ...state,
    alerts,
    automation,
    demo: { ...state.demo, demoTimeMs: newTime },
  };
}

function nextCheckpoint(state: AppState): number | null {
  const now = state.demo.demoTimeMs;
  const candidates: number[] = [];
  for (const c of Object.values(state.cases)) {
    if (c.status === 'Resolved' || c.status === 'Closed') continue;
    if (c.nextActionDeadline && c.nextActionDeadline > now) candidates.push(c.nextActionDeadline);
    if (c.nextClientUpdate && c.nextClientUpdate > now) candidates.push(c.nextClientUpdate);
    if (c.partner.nextChase && c.partner.nextChase > now) candidates.push(c.partner.nextChase);
    if (c.engineering.infoDeadline && c.engineering.infoDeadline > now)
      candidates.push(c.engineering.infoDeadline);
    if (c.handover && !c.handover.accepted) candidates.push(c.handover.requestedAt + 30 * MIN);
  }
  if (candidates.length === 0) return null;
  return Math.min(...candidates);
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'RESET_DEMO':
      return buildInitialState();

    case 'ACKNOWLEDGE_CASE':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        status: c.status === 'New' ? 'Acknowledged' : c.status,
        accountableOwner: action.owner,
        severity: action.severity,
        acknowledgedAt: state.demo.demoTimeMs,
        nextClientUpdate: action.nextClientUpdate,
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            'Support accepted',
            `Classified as ${action.severity}, owner assigned: ${action.owner}.`,
          ),
        ],
      }));

    case 'SET_NEXT_ACTION':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        status:
          c.status === 'New' || c.status === 'Acknowledged' ? 'Investigating' : c.status,
        nextAction: action.nextAction,
        nextActionOwner: action.nextActionOwner,
        nextActionDeadline: action.nextActionDeadline,
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            c.nextAction ? 'Next action revised' : 'Next action set',
            action.reason ?? action.nextAction,
          ),
        ],
      }));

    case 'REQUEST_ENGINEERING':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        status: 'Waiting on Engineering',
        waitingOn: 'Engineering',
        engineeringIssueRef: action.issueRef,
        engineering: {
          status: 'Requested',
          issueRef: action.issueRef,
          requestedAt: state.demo.demoTimeMs,
        },
        timeline: [
          ...c.timeline,
          mkEvent(state.demo.demoTimeMs, action.actor, 'Engineering requested', `Filed ${action.issueRef}.`),
        ],
      }));

    case 'ENGINEERING_ACCEPT':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        technicalOwner: action.technicalOwner,
        engineering: {
          ...c.engineering,
          status: 'Accepted',
          technicalOwner: action.technicalOwner,
          acceptedAt: state.demo.demoTimeMs,
        },
        timeline: [
          ...c.timeline,
          mkEvent(state.demo.demoTimeMs, action.actor, 'Engineering accepted', `Owned by ${action.technicalOwner}.`),
        ],
      }));

    case 'ENGINEERING_REQUEST_INFO':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        engineering: {
          ...c.engineering,
          status: 'Info Requested',
          infoNeeded: action.infoNeeded,
          infoRequestedFrom: action.infoRequestedFrom,
          infoDeadline: action.infoDeadline,
        },
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            'Engineering requested information',
            `Needs "${action.infoNeeded}" from ${action.infoRequestedFrom}.`,
          ),
        ],
      }));

    case 'ENGINEERING_REDIRECT':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        technicalOwner: action.newOwner,
        engineering: {
          ...c.engineering,
          status: 'Redirected',
          redirectDestination: action.redirectDestination,
          redirectReason: action.redirectReason,
          technicalOwner: action.newOwner,
        },
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            'Engineering redirected',
            `To ${action.redirectDestination}: ${action.redirectReason}`,
          ),
        ],
      }));

    case 'ADD_PARTNER':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        status: 'Waiting on Partner',
        waitingOn: 'Partner',
        partner: {
          partnerName: action.partnerName,
          caseRef: action.caseRef,
          impactSent: action.impactSent,
          internalOwner: action.internalOwner,
          nextChase: action.nextChase,
          lastContacted: state.demo.demoTimeMs,
        },
        timeline: [
          ...c.timeline,
          mkEvent(state.demo.demoTimeMs, action.actor, 'Partner added', `${action.partnerName} (${action.caseRef}).`),
        ],
      }));

    case 'RECORD_PARTNER_CHASE':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        partner: {
          ...c.partner,
          nextChase: action.nextChase,
          lastContacted: state.demo.demoTimeMs,
        },
        timeline: [
          ...c.timeline,
          mkEvent(state.demo.demoTimeMs, action.actor, 'Partner follow-up recorded', action.note),
        ],
      }));

    case 'RETURN_TECHNICAL_OUTCOME':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        status: 'Ready to Verify',
        waitingOn: null,
        timeline: [
          ...c.timeline,
          mkEvent(state.demo.demoTimeMs, action.actor, 'Technical outcome returned', action.note),
        ],
      }));

    case 'VERIFY_CASE': {
      const updated = updateCase(state, action.caseId, (c) => {
        const record: VerificationRecord = {
          result: action.result,
          timestamp: state.demo.demoTimeMs,
          notes: action.notes,
          remainingImpact: action.remainingImpact,
          owner: action.followOwner,
          deadline: action.followDeadline,
        };
        let status = c.status;
        let nextAction = c.nextAction;
        let nextActionOwner = c.nextActionOwner;
        let nextActionDeadline = c.nextActionDeadline;

        if (action.result === 'Verified Resolved') {
          status = 'Resolved';
        } else if (action.result === 'Still Impacted') {
          status = 'Investigating';
          nextAction = action.newNextAction ?? undefined;
          nextActionOwner = action.followOwner ?? c.accountableOwner;
          nextActionDeadline = action.followDeadline;
        } else if (action.result === 'Partially Resolved') {
          status = 'Investigating';
          nextAction = action.newNextAction ?? `Resolve remaining impact: ${action.remainingImpact ?? ''}`;
          nextActionOwner = action.followOwner ?? c.accountableOwner;
          nextActionDeadline = action.followDeadline;
        }

        return {
          ...c,
          status,
          nextAction,
          nextActionOwner,
          nextActionDeadline,
          verifications: [...c.verifications, record],
          timeline: [
            ...c.timeline,
            mkEvent(state.demo.demoTimeMs, action.actor, 'Verification completed', action.result),
          ],
        };
      });
      if (action.result === 'Verified Resolved') {
        return { ...updated, alerts: updated.alerts.filter((a) => a.caseId !== action.caseId) };
      }
      return updated;
    }

    case 'CLOSE_CASE': {
      const updated = updateCase(state, action.caseId, (c) => {
        if (c.status !== 'Resolved') return c;
        const closure: ClosureRecord = {
          resolutionSummary: action.resolutionSummary,
          verificationEvidence: action.verificationEvidence,
          finalClientComm: action.finalClientComm,
          followUpTasks: action.followUpTasks,
          closedAt: state.demo.demoTimeMs,
        };
        return {
          ...c,
          status: 'Closed',
          closure,
          timeline: [...c.timeline, mkEvent(state.demo.demoTimeMs, action.actor, 'Case closed', action.resolutionSummary)],
        };
      });
      return { ...updated, alerts: updated.alerts.filter((a) => a.caseId !== action.caseId) };
    }

    case 'RECORD_CLIENT_UPDATE':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        nextClientUpdate: action.nextUpdateDue,
        clientUpdates: [
          ...c.clientUpdates,
          {
            id: makeId('upd'),
            timestamp: state.demo.demoTimeMs,
            summary: action.summary,
            channel: action.channel,
            nextUpdateDue: action.nextUpdateDue,
            actor: action.actor,
          },
        ],
        timeline: [
          ...c.timeline,
          mkEvent(state.demo.demoTimeMs, action.actor, 'Client update recorded', action.summary),
        ],
      }));

    case 'CHANGE_SEVERITY':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        severity: action.newSeverity,
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            'Severity changed',
            `${c.severity} → ${action.newSeverity}. Reason: ${action.reason}`,
          ),
        ],
      }));

    case 'CHANGE_DEADLINE':
      return updateCase(state, action.caseId, (c) => {
        const oldValue = c[action.field];
        return {
          ...c,
          [action.field]: action.newValue,
          timeline: [
            ...c.timeline,
            mkEvent(
              state.demo.demoTimeMs,
              action.actor,
              action.field === 'nextActionDeadline' ? 'Deadline changed' : 'Next client update changed',
              `Previously ${oldValue ? new Date(oldValue).toLocaleString() : 'unset'}. Reason: ${action.reason}`,
            ),
          ],
        };
      });

    case 'REQUEST_HANDOVER':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        handover: {
          id: makeId('handover'),
          fromOwner: action.actor,
          toOwner: action.toOwner,
          currentImpact: action.currentImpact,
          currentTechnicalStatus: action.currentTechnicalStatus,
          currentDependency: action.currentDependency,
          nextAction: action.nextAction,
          nextActionDeadline: action.nextActionDeadline,
          nextClientUpdate: action.nextClientUpdate,
          requestedAt: state.demo.demoTimeMs,
          accepted: false,
        },
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            'Owner transfer requested',
            `${action.actor} → ${action.toOwner}.`,
          ),
        ],
      }));

    case 'ACCEPT_HANDOVER':
      return updateCase(state, action.caseId, (c) => {
        if (!c.handover || c.handover.accepted) return c;
        return {
          ...c,
          accountableOwner: c.handover.toOwner,
          nextAction: c.handover.nextAction,
          nextActionDeadline: c.handover.nextActionDeadline,
          nextClientUpdate: c.handover.nextClientUpdate,
          handover: { ...c.handover, accepted: true, acceptedAt: state.demo.demoTimeMs },
          timeline: [
            ...c.timeline,
            mkEvent(
              state.demo.demoTimeMs,
              c.handover.toOwner,
              'Handover accepted',
              `${c.handover.toOwner} is now accountable.`,
            ),
          ],
        };
      });

    case 'REQUEST_EXECUTIVE_DECISION':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        executiveRequest: {
          decisionRequired: action.decisionRequired,
          whyInsufficient: action.whyInsufficient,
          businessImpact: action.businessImpact,
          requestedAt: state.demo.demoTimeMs,
          requestedBy: action.actor,
        },
        timeline: [
          ...c.timeline,
          mkEvent(
            state.demo.demoTimeMs,
            action.actor,
            'Executive decision requested',
            action.decisionRequired,
          ),
        ],
      }));

    case 'CREATE_DEBRIEF':
      return updateCase(state, action.caseId, (c) => ({
        ...c,
        debrief: { ...action.debrief, createdAt: state.demo.demoTimeMs },
        timeline: [...c.timeline, mkEvent(state.demo.demoTimeMs, action.actor, 'Debrief created')],
      }));

    case 'ACK_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) => (a.id === action.alertId ? { ...a, acknowledged: true } : a)),
      };

    case 'ADVANCE_TIME':
      return applyTimeAdvance(state, state.demo.demoTimeMs + action.deltaMs);

    case 'JUMP_TO_NEXT_CHECKPOINT': {
      const cp = nextCheckpoint(state);
      const target = cp !== null ? cp + 60_000 : state.demo.demoTimeMs + 60 * MIN;
      return applyTimeAdvance(state, target);
    }

    case 'SET_ROLE':
      return { ...state, demo: { ...state.demo, role: action.role } };

    case 'TOGGLE_PRESENTATION_MODE':
      return { ...state, demo: { ...state.demo, presentationMode: !state.demo.presentationMode } };

    case 'GUIDED_DEMO_START':
      return { ...state, demo: { ...state.demo, guidedDemoActive: true, guidedDemoStep: 1 } };

    case 'GUIDED_DEMO_STEP':
      return { ...state, demo: { ...state.demo, guidedDemoStep: action.step } };

    case 'GUIDED_DEMO_EXIT':
      return { ...state, demo: { ...state.demo, guidedDemoActive: false, guidedDemoStep: 0 } };

    case 'SIMULATE_AUTOMATION_FAILURE':
      return {
        ...state,
        automation: {
          ...state.automation,
          monitorHealthy: false,
          failureSimulatedAt: state.demo.demoTimeMs,
        },
      };

    case 'RESTORE_MONITOR': {
      const restored: AppState = {
        ...state,
        automation: { ...state.automation, monitorHealthy: true, failureSimulatedAt: null },
      };
      return applyTimeAdvance(restored, state.demo.demoTimeMs);
    }

    default:
      return state;
  }
}
