import type { Alert, AlertBreach, AppState, EscalationCase, RoleName } from '../types';
import { SEVERITY_MODEL } from '../lib/severity';
import { MIN } from '../lib/time';
import { makeId } from '../lib/id';

export const ACTIVE_STATUSES = [
  'New',
  'Acknowledged',
  'Investigating',
  'Waiting on Engineering',
  'Waiting on Partner',
  'Ready to Verify',
] as const;

export function isActive(c: EscalationCase): boolean {
  return c.status !== 'Resolved' && c.status !== 'Closed';
}

export interface StuckFlags {
  noOwner: boolean;
  overdueNextAction: boolean;
  missedClientUpdate: boolean;
  overduePartnerFollowUp: boolean;
  missingTechnicalAcceptance: boolean;
  missedAcknowledgement: boolean;
  anyStuck: boolean;
}

/** Derives visible "stuck" conditions for a case at a given point in demo time. No generic status exists — these are always computed. */
export function getStuckFlags(c: EscalationCase, now: number): StuckFlags {
  const model = SEVERITY_MODEL[c.severity];
  const noOwner = isActive(c) && c.status !== 'New' && !c.accountableOwner;
  const missedAcknowledgement =
    c.status === 'New' && now - c.reportedAt > model.acknowledgeTargetMs;
  const overdueNextAction =
    isActive(c) &&
    c.status !== 'Ready to Verify' &&
    !!c.nextActionDeadline &&
    now > c.nextActionDeadline;
  const missedClientUpdate =
    isActive(c) && !!c.nextClientUpdate && now > c.nextClientUpdate;
  const overduePartnerFollowUp =
    c.waitingOn === 'Partner' && !!c.partner.nextChase && now > c.partner.nextChase;
  const missingTechnicalAcceptance =
    c.waitingOn === 'Engineering' &&
    c.engineering.status === 'Requested' &&
    !!c.engineering.requestedAt &&
    now - c.engineering.requestedAt > model.ownerPlanTargetMs;

  return {
    noOwner,
    overdueNextAction,
    missedClientUpdate,
    overduePartnerFollowUp,
    missingTechnicalAcceptance,
    missedAcknowledgement,
    anyStuck:
      noOwner ||
      overdueNextAction ||
      missedClientUpdate ||
      overduePartnerFollowUp ||
      missingTechnicalAcceptance ||
      missedAcknowledgement,
  };
}

interface DetectedBreach {
  breach: AlertBreach;
  since: number;
  responsibleOwner: string;
  requiredNextAction: string;
}

function detectBreaches(c: EscalationCase, now: number): DetectedBreach[] {
  const flags = getStuckFlags(c, now);
  const out: DetectedBreach[] = [];
  const owner = c.accountableOwner ?? 'Maya (Support Lead — unowned case)';

  if (flags.missedAcknowledgement) {
    out.push({
      breach: 'Missed acknowledgement target',
      since: c.reportedAt + SEVERITY_MODEL[c.severity].acknowledgeTargetMs,
      responsibleOwner: 'Maya (Support Lead)',
      requiredNextAction: 'Acknowledge the case and assign an accountable owner immediately.',
    });
  }
  if (flags.noOwner) {
    out.push({
      breach: 'Missing accountable owner',
      since: now,
      responsibleOwner: 'Maya (Support Lead)',
      requiredNextAction: 'Assign an accountable support owner.',
    });
  }
  if (isActive(c) && c.status !== 'New' && !c.nextAction) {
    out.push({
      breach: 'Missing next action',
      since: now,
      responsibleOwner: owner,
      requiredNextAction: 'Record a next action, owner, and deadline for this case.',
    });
  }
  if (flags.overdueNextAction && c.nextActionDeadline) {
    out.push({
      breach: 'Overdue next action',
      since: c.nextActionDeadline,
      responsibleOwner: owner,
      requiredNextAction: 'Provide a revised next action and deadline.',
    });
  }
  if (flags.missedClientUpdate && c.nextClientUpdate) {
    out.push({
      breach: 'Missed client update',
      since: c.nextClientUpdate,
      responsibleOwner: owner,
      requiredNextAction: 'Send the client an update now and reset the next-update timer.',
    });
  }
  if (flags.overduePartnerFollowUp && c.partner.nextChase) {
    out.push({
      breach: 'Partner follow-up overdue',
      since: c.partner.nextChase,
      responsibleOwner: c.partner.internalOwner ?? owner,
      requiredNextAction: 'Chase the partner and record a new checkpoint.',
    });
  }
  if (flags.missingTechnicalAcceptance && c.engineering.requestedAt) {
    out.push({
      breach: 'Engineering acceptance overdue',
      since: c.engineering.requestedAt + SEVERITY_MODEL[c.severity].ownerPlanTargetMs,
      responsibleOwner: c.engineering.technicalOwner ?? 'Engineering Lead',
      requiredNextAction: 'Follow up with Engineering for explicit acceptance.',
    });
  }
  if (c.handover && !c.handover.accepted && now - c.handover.requestedAt > 30 * MIN) {
    out.push({
      breach: 'Pending handover not accepted',
      since: c.handover.requestedAt + 30 * MIN,
      responsibleOwner: c.handover.toOwner,
      requiredNextAction: 'Confirm the incoming owner has accepted the handover.',
    });
  }
  return out;
}

/**
 * Runs the simulated stall/overdue monitor across all active cases.
 * Deduplicates by (caseId, breach) signature so unchanged conditions do not
 * spawn repeat alerts — existing alerts are refreshed in place instead.
 */
export function runMonitorScan(
  state: AppState,
  now: number,
): { alerts: Alert[]; casesScanned: number; createdNew: boolean } {
  const activeCases = Object.values(state.cases).filter(isActive);
  const nextAlerts: Alert[] = [];
  let createdNew = false;

  for (const c of activeCases) {
    const breaches = detectBreaches(c, now);
    for (const b of breaches) {
      const signature = `${c.id}::${b.breach}`;
      const existing = state.alerts.find((a) => a.signature === signature);
      if (existing) {
        nextAlerts.push({ ...existing, overdueSinceMs: now - b.since });
      } else {
        createdNew = true;
        nextAlerts.push({
          id: makeId('alert'),
          caseId: c.id,
          breach: b.breach,
          responsibleOwner: b.responsibleOwner,
          createdAt: now,
          overdueSinceMs: now - b.since,
          requiredNextAction: b.requiredNextAction,
          acknowledged: false,
          signature,
        });
      }
    }
  }

  return { alerts: nextAlerts, casesScanned: activeCases.length, createdNew };
}

export function roleLabel(role: RoleName): string {
  switch (role) {
    case 'Joy':
      return 'Joy — Support / Case Owner';
    case 'Maya':
      return 'Maya — Support Lead';
    case 'Leo':
      return 'Leo — Engineer';
    case 'Nina':
      return 'Nina — Integrations';
    case 'External Partner':
      return 'External Partner — Partner Queue';
    case 'COO':
      return 'COO — Executive';
  }
}

export function queueCounters(state: AppState, now: number) {
  const active = Object.values(state.cases).filter(isActive);
  let critical = 0;
  let needsOwner = 0;
  let waitingOnPartner = 0;
  let clientUpdateDue = 0;
  for (const c of active) {
    const flags = getStuckFlags(c, now);
    if (c.severity === 'P1' && flags.anyStuck) critical++;
    if (flags.noOwner || c.status === 'New') needsOwner++;
    if (c.status === 'Waiting on Partner') waitingOnPartner++;
    if (flags.missedClientUpdate) clientUpdateDue++;
  }
  return { critical, needsOwner, waitingOnPartner, clientUpdateDue };
}
