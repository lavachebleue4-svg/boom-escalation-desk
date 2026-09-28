import type { AppState, EscalationCase } from '../types';
import { MIN, HOUR, DAY } from '../lib/time';
import { makeId } from '../lib/id';

// Fixed fictional anchor so the demo never depends on real wall-clock time.
export const DEMO_START = new Date('2025-06-02T09:00:00').getTime();

function ev(timestamp: number, actor: string, action: string, reason?: string) {
  return { id: makeId('evt'), timestamp, actor, action, reason };
}

const mainCase: EscalationCase = {
  id: 'case-main',
  client: 'Demo Property Group',
  issueTitle: 'Listings offline across multiple channels',
  severity: 'P1',
  status: 'New',
  customerImpact:
    'Client reports that affected listings are unavailable and may be losing booking revenue.',
  reportedAt: DEMO_START,
  waitingOn: null,
  engineering: { status: 'Not Requested' },
  partner: {},
  supportTicketRef: 'SUP-1071',
  timeline: [
    ev(
      DEMO_START,
      'AI Support Agent',
      'Responded to client first. Client says the problem remains unresolved — routed to human Support for escalation.',
    ),
  ],
  clientUpdates: [],
  verifications: [],
  createdAt: DEMO_START,
};

const harbourCase: EscalationCase = {
  id: 'case-harbour',
  client: 'Harbour Demo',
  issueTitle: 'Reservation sync intermittently failing',
  severity: 'P2',
  status: 'Waiting on Engineering',
  customerImpact:
    'Some reservations made on partner channels are not syncing into the client dashboard, risking double-bookings.',
  reportedAt: DEMO_START - 3 * HOUR,
  acknowledgedAt: DEMO_START - 2 * HOUR - 50 * MIN,
  accountableOwner: 'Joy',
  technicalOwner: 'Leo',
  nextAction: 'Leo to deploy the patched sync worker to staging and confirm the fix holds.',
  nextActionOwner: 'Leo',
  nextActionDeadline: DEMO_START - 30 * MIN,
  nextClientUpdate: DEMO_START + 20 * MIN,
  waitingOn: 'Engineering',
  engineering: {
    status: 'Accepted',
    issueRef: 'ENG-4821',
    technicalOwner: 'Leo',
    requestedAt: DEMO_START - 2 * HOUR - 40 * MIN,
    acceptedAt: DEMO_START - 2 * HOUR,
  },
  partner: {},
  supportTicketRef: 'SUP-1042',
  engineeringIssueRef: 'ENG-4821',
  timeline: [
    ev(DEMO_START - 3 * HOUR, 'Joy', 'Case created', 'Client reported intermittent missed reservations.'),
    ev(DEMO_START - 2 * HOUR - 50 * MIN, 'Joy', 'Support accepted', 'Acknowledged and classified as P2.'),
    ev(DEMO_START - 2 * HOUR - 40 * MIN, 'Joy', 'Engineering requested', 'Filed ENG-4821 for sync worker investigation.'),
    ev(DEMO_START - 2 * HOUR, 'Leo', 'Engineering accepted', 'Reproduced the issue locally, working on a patch.'),
    ev(DEMO_START - 1 * HOUR, 'Joy', 'Client update recorded', 'Told client a fix is in progress, next update in 1 hour.'),
  ],
  clientUpdates: [
    {
      id: makeId('upd'),
      timestamp: DEMO_START - 1 * HOUR,
      summary: 'Fix in progress with Engineering; will confirm once verified in staging.',
      channel: 'Client Slack Channel',
      nextUpdateDue: DEMO_START + 20 * MIN,
      actor: 'Joy',
    },
  ],
  verifications: [],
  createdAt: DEMO_START - 3 * HOUR,
};

const cityStayCase: EscalationCase = {
  id: 'case-citystay',
  client: 'CityStay Demo',
  issueTitle: 'Partner feed delay',
  severity: 'P2',
  status: 'Waiting on Partner',
  customerImpact:
    'Booking feed from the distribution partner is delayed up to 45 minutes, so availability shown to guests may be stale.',
  reportedAt: DEMO_START - 5 * HOUR,
  acknowledgedAt: DEMO_START - 4 * HOUR - 50 * MIN,
  accountableOwner: 'Joy',
  nextAction: 'Chase partner support for an ETA on clearing the feed backlog.',
  nextActionOwner: 'Joy',
  nextActionDeadline: DEMO_START - 15 * MIN,
  nextClientUpdate: DEMO_START + 1 * HOUR,
  waitingOn: 'Partner',
  engineering: { status: 'Not Requested' },
  partner: {
    partnerName: 'ChannelSync Partner Ltd',
    caseRef: 'PTR-2291',
    impactSent: 'Booking feed delayed up to 45 minutes across affected channels.',
    lastContacted: DEMO_START - 4 * HOUR,
    internalOwner: 'Joy',
    nextChase: DEMO_START - 15 * MIN,
  },
  supportTicketRef: 'SUP-1058',
  timeline: [
    ev(DEMO_START - 5 * HOUR, 'Joy', 'Case created', 'Client flagged stale availability from partner feed.'),
    ev(DEMO_START - 4 * HOUR - 50 * MIN, 'Joy', 'Support accepted', 'Acknowledged and classified as P2.'),
    ev(DEMO_START - 4 * HOUR, 'Joy', 'Partner added', 'Opened PTR-2291 with ChannelSync Partner Ltd.'),
  ],
  clientUpdates: [],
  verifications: [],
  createdAt: DEMO_START - 5 * HOUR,
};

const lakesideCase: EscalationCase = {
  id: 'case-lakeside',
  client: 'Lakeside Demo',
  issueTitle: 'Reporting discrepancy',
  severity: 'P3',
  status: 'Investigating',
  customerImpact:
    "Client's monthly reporting export shows roughly a 4% discrepancy versus dashboard totals; no impact to live operations.",
  reportedAt: DEMO_START - DAY,
  acknowledgedAt: DEMO_START - DAY + 1 * HOUR,
  accountableOwner: 'Joy',
  nextAction: 'Compare the reporting export against source booking data to isolate the discrepancy.',
  nextActionOwner: 'Joy',
  nextActionDeadline: DEMO_START + 3 * HOUR,
  nextClientUpdate: DEMO_START + 5 * HOUR,
  waitingOn: null,
  engineering: { status: 'Not Requested' },
  partner: {},
  supportTicketRef: 'SUP-1011',
  timeline: [
    ev(DEMO_START - DAY, 'Joy', 'Case created', 'Client noticed export totals did not match dashboard.'),
    ev(DEMO_START - DAY + 1 * HOUR, 'Joy', 'Support accepted', 'Acknowledged and classified as P3.'),
  ],
  clientUpdates: [],
  verifications: [],
  createdAt: DEMO_START - DAY,
};

export function buildInitialState(): AppState {
  const cases: Record<string, EscalationCase> = {
    [mainCase.id]: mainCase,
    [harbourCase.id]: harbourCase,
    [cityStayCase.id]: cityStayCase,
    [lakesideCase.id]: lakesideCase,
  };
  return {
    cases,
    alerts: [],
    automation: {
      monitorHealthy: true,
      lastSuccessfulScan: DEMO_START,
      casesScanned: 0,
      lastAlertCreated: null,
      healthCheckFailed: false,
      failureSimulatedAt: null,
      lastHealthCheck: DEMO_START,
    },
    demo: {
      demoTimeMs: DEMO_START,
      role: 'Joy',
      presentationMode: false,
      guidedDemoActive: false,
      guidedDemoStep: 0,
    },
  };
}
