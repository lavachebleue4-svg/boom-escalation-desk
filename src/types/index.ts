// ─────────────────────────────────────────────────────────────
// Core domain types for the Boom Escalation Desk prototype.
// All timestamps are milliseconds on the simulated DEMO clock,
// never the machine's real time.
// ─────────────────────────────────────────────────────────────

export type Severity = 'P1' | 'P2' | 'P3';

export type CaseStatus =
  | 'New'
  | 'Acknowledged'
  | 'Investigating'
  | 'Waiting on Engineering'
  | 'Waiting on Partner'
  | 'Ready to Verify'
  | 'Resolved'
  | 'Closed';

export type RoleName = 'Joy' | 'Maya' | 'Leo' | 'Nina' | 'External Partner' | 'COO';

export type UpdateChannel = 'Client Slack Channel' | 'Email' | 'Meeting / Call';

export type EngineeringStatus =
  | 'Not Requested'
  | 'Requested'
  | 'Accepted'
  | 'Info Requested'
  | 'Redirected';

export interface EngineeringInfo {
  status: EngineeringStatus;
  issueRef?: string;
  technicalOwner?: RoleName;
  infoNeeded?: string;
  infoRequestedFrom?: string;
  infoDeadline?: number;
  redirectDestination?: string;
  redirectReason?: string;
  requestedAt?: number;
  acceptedAt?: number;
}

export interface PartnerInfo {
  partnerName?: string;
  caseRef?: string;
  impactSent?: string;
  lastContacted?: number;
  internalOwner?: RoleName;
  nextChase?: number;
}

export interface ClientUpdateRecord {
  id: string;
  timestamp: number;
  summary: string;
  channel: UpdateChannel;
  nextUpdateDue: number;
  actor: RoleName;
}

export interface HandoverRequest {
  id: string;
  fromOwner: RoleName;
  toOwner: RoleName;
  currentImpact: string;
  currentTechnicalStatus: string;
  currentDependency: string;
  nextAction: string;
  nextActionDeadline: number;
  nextClientUpdate: number;
  requestedAt: number;
  accepted: boolean;
  acceptedAt?: number;
}

export type AlertBreach =
  | 'Missing accountable owner'
  | 'Missing next action'
  | 'Overdue next action'
  | 'Missed acknowledgement target'
  | 'Missed client update'
  | 'Partner follow-up overdue'
  | 'Engineering acceptance overdue'
  | 'Pending handover not accepted';

export interface Alert {
  id: string;
  caseId: string;
  breach: AlertBreach;
  responsibleOwner: string;
  createdAt: number;
  overdueSinceMs: number;
  requiredNextAction: string;
  acknowledged: boolean;
  signature: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  owner: RoleName;
  deadline: number;
}

export interface Debrief {
  whatHappened: string;
  whenAware: string;
  clientImpact: string;
  whereStalled: string;
  dependencyInvolved: string;
  whatWorked: string;
  whatFailed: string;
  rootCause: string; // may be "Unknown / still under investigation"
  facts: string[];
  assumptions: string[];
  followUps: string[];
  correctiveActions: CorrectiveAction[];
  createdAt: number;
}

export interface VerificationRecord {
  result: 'Verified Resolved' | 'Still Impacted' | 'Partially Resolved';
  timestamp: number;
  notes: string;
  remainingImpact?: string;
  owner?: RoleName;
  deadline?: number;
}

export interface ClosureRecord {
  resolutionSummary: string;
  verificationEvidence: string;
  finalClientComm: string;
  followUpTasks: string[];
  closedAt: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  reason?: string;
}

export interface EscalationCase {
  id: string;
  client: string;
  issueTitle: string;
  severity: Severity;
  status: CaseStatus;
  customerImpact: string;

  reportedAt: number;
  acknowledgedAt?: number;

  accountableOwner?: RoleName;
  technicalOwner?: RoleName;

  nextAction?: string;
  nextActionOwner?: RoleName;
  nextActionDeadline?: number;

  nextClientUpdate?: number;

  waitingOn: 'Engineering' | 'Partner' | null;

  engineering: EngineeringInfo;
  partner: PartnerInfo;

  supportTicketRef: string;
  engineeringIssueRef?: string;

  timeline: TimelineEvent[];
  clientUpdates: ClientUpdateRecord[];

  handover?: HandoverRequest;
  verifications: VerificationRecord[];
  closure?: ClosureRecord;
  debrief?: Debrief;
  executiveRequest?: {
    decisionRequired: string;
    whyInsufficient: string;
    businessImpact: string;
    requestedAt: number;
    requestedBy: RoleName;
  };

  createdAt: number;
}

export interface AutomationState {
  monitorHealthy: boolean;
  lastSuccessfulScan: number | null;
  casesScanned: number;
  lastAlertCreated: number | null;
  healthCheckFailed: boolean;
  failureSimulatedAt: number | null;
  lastHealthCheck: number | null;
}

export interface DemoState {
  demoTimeMs: number;
  role: RoleName;
  presentationMode: boolean;
  guidedDemoActive: boolean;
  guidedDemoStep: number;
}

export interface AppState {
  cases: Record<string, EscalationCase>;
  alerts: Alert[];
  automation: AutomationState;
  demo: DemoState;
}
