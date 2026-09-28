import { useState, type ReactNode } from 'react';
import { useStore } from '../state/store';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { DeadlineIndicator } from './DeadlineIndicator';
import { OwnershipModel } from './case/OwnershipModel';
import { Timeline } from './case/Timeline';
import { getStuckFlags } from '../state/derive';
import { formatDemoTime } from '../lib/time';
import { SEVERITY_MODEL } from '../lib/severity';

import { AcknowledgeModal } from './case/modals/AcknowledgeModal';
import { NextActionModal } from './case/modals/NextActionModal';
import {
  RequestEngineeringModal,
  EngineeringAcceptModal,
  EngineeringRequestInfoModal,
  EngineeringRedirectModal,
} from './case/modals/EngineeringModals';
import { AddPartnerModal, RecordPartnerChaseModal } from './case/modals/PartnerModals';
import { ReturnOutcomeModal, VerifyModal, CloseCaseModal } from './case/modals/OutcomeVerifyClose';
import { ClientUpdateModal } from './case/modals/ClientUpdateModal';
import { ChangeSeverityModal, ChangeDeadlineModal } from './case/modals/SeverityDeadlineModals';
import { RequestHandoverModal, AcceptHandoverModal } from './case/modals/HandoverModals';
import { ExecutiveDecisionModal } from './case/modals/ExecutiveModal';
import { DebriefModal } from './case/modals/DebriefModal';

type ModalKind =
  | 'acknowledge'
  | 'nextAction'
  | 'requestEngineering'
  | 'engineeringAccept'
  | 'engineeringInfo'
  | 'engineeringRedirect'
  | 'addPartner'
  | 'partnerChase'
  | 'returnOutcome'
  | 'verify'
  | 'close'
  | 'clientUpdate'
  | 'changeSeverity'
  | 'changeNextActionDeadline'
  | 'changeNextClientUpdate'
  | 'requestHandover'
  | 'acceptHandover'
  | 'executive'
  | 'debrief'
  | null;

export function CaseWorkspace({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const { state } = useStore();
  const c = state.cases[caseId];
  const [modal, setModal] = useState<ModalKind>(null);
  const now = state.demo.demoTimeMs;

  if (!c) return null;
  const flags = getStuckFlags(c, now);
  const isActive = c.status !== 'Resolved' && c.status !== 'Closed';
  const relatedAlerts = state.alerts.filter((a) => a.caseId === c.id && !a.acknowledged);

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-sm font-medium text-charcoal-soft hover:text-charcoal">
        ← Back to Queue
      </button>

      {/* Header */}
      <div className="mb-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-charcoal">{c.client}</h1>
              <SeverityBadge severity={c.severity} />
              <StatusBadge status={c.status} />
              {flags.anyStuck && <Badge tone="red">Needs attention</Badge>}
            </div>
            <p className="mt-1 text-sm text-charcoal-soft">{c.issueTitle}</p>
          </div>
          <div className="text-right text-sm">
            <div className="text-[11px] uppercase tracking-wide text-muted">Accountable Support Owner</div>
            <div className="font-medium text-charcoal">{c.accountableOwner ?? '— unassigned —'}</div>
          </div>
        </div>
      </div>

      {relatedAlerts.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-border bg-red-bg px-4 py-3">
          <div className="text-sm font-semibold text-red">Missed checkpoint — internal escalation</div>
          {relatedAlerts.map((a) => (
            <div key={a.id} className="mt-1 text-sm text-charcoal">
              <span className="font-medium">{a.breach}.</span> Responsible: {a.responsibleOwner}. Required next
              action: {a.requiredNextAction}
            </div>
          ))}
        </div>
      )}

      {c.handover && !c.handover.accepted && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-purple-border bg-purple-bg px-4 py-3">
          <div className="text-sm text-charcoal">
            <span className="font-semibold text-purple">Handover Pending</span> — {c.handover.fromOwner} →{' '}
            {c.handover.toOwner}. {c.handover.fromOwner} remains accountable until accepted.
          </div>
          <Button variant="primary" className="!py-1" onClick={() => setModal('acceptHandover')}>
            Accept Handover
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* LEFT: operational details */}
        <div className="space-y-4">
          <OwnershipModel c={c} />

          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Customer Impact</h3>
            <p className="text-sm text-charcoal">{c.customerImpact}</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Info label="Reported at" value={formatDemoTime(c.reportedAt)} />
              <Info label="Acknowledged at" value={c.acknowledgedAt ? formatDemoTime(c.acknowledgedAt) : '—'} />
              <Info label="Support ticket" value={c.supportTicketRef} mono />
              <Info label="Engineering issue" value={c.engineeringIssueRef ?? '—'} mono />
              <Info label="Partner case reference" value={c.partner.caseRef ?? '—'} mono />
              <Info label="Waiting on" value={c.waitingOn ?? 'No one — active with Support'} />
            </div>
            <p className="mt-3 text-[11px] text-muted">
              Proposed targets for {c.severity}: acknowledge {SEVERITY_MODEL[c.severity].acknowledgeLabel}, owner +
              next action {SEVERITY_MODEL[c.severity].ownerPlanLabel}, client updates{' '}
              {SEVERITY_MODEL[c.severity].updateCadenceLabel.toLowerCase()}.
            </p>
          </div>

          {/* Next action + deadlines */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">Next Action</h3>
              {isActive && (
                <button className="text-xs font-medium text-blue hover:underline" onClick={() => setModal('nextAction')}>
                  {c.nextAction ? 'Revise' : 'Set next action'}
                </button>
              )}
            </div>
            <p className={`text-sm ${c.nextAction ? 'text-charcoal' : 'font-medium text-red'}`}>
              {c.nextAction ?? 'Not set — required for an active escalation.'}
            </p>
            {c.nextActionOwner && <p className="mt-1 text-xs text-charcoal-soft">Owner: {c.nextActionOwner}</p>}
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <DeadlineIndicator label="Next-action deadline" target={c.nextActionDeadline} now={now} />
                </div>
                {isActive && (
                  <button className="text-xs text-blue hover:underline" onClick={() => setModal('changeNextActionDeadline')}>
                    Edit
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <DeadlineIndicator
                    label="Next client update"
                    target={c.nextClientUpdate}
                    now={now}
                    approachingWindowMs={30 * 60_000}
                  />
                </div>
                {isActive && (
                  <button className="text-xs text-blue hover:underline" onClick={() => setModal('changeNextClientUpdate')}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Engineering panel */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Engineering / Integrations
            </h3>
            {c.engineering.status === 'Not Requested' ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-charcoal-soft">Not yet involved.</p>
                {isActive && (
                  <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('requestEngineering')}>
                    Escalate to Engineering
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <Badge tone={c.engineering.status === 'Accepted' ? 'green' : 'amber'}>{c.engineering.status}</Badge>
                  <span className="text-xs text-muted">{c.engineeringIssueRef}</span>
                </div>
                {c.engineering.technicalOwner && (
                  <p className="text-charcoal-soft">Technical owner: {c.engineering.technicalOwner}</p>
                )}
                {c.engineering.status === 'Info Requested' && (
                  <p className="text-charcoal-soft">
                    Needs "{c.engineering.infoNeeded}" from {c.engineering.infoRequestedFrom} by{' '}
                    {formatDemoTime(c.engineering.infoDeadline)}.
                  </p>
                )}
                {c.engineering.status === 'Redirected' && (
                  <p className="text-charcoal-soft">
                    Redirected to {c.engineering.redirectDestination}: {c.engineering.redirectReason}
                  </p>
                )}
                {isActive && c.engineering.status === 'Requested' && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('engineeringAccept')}>
                      Accept
                    </Button>
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('engineeringInfo')}>
                      Request Information
                    </Button>
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('engineeringRedirect')}>
                      Redirect
                    </Button>
                  </div>
                )}
                {isActive && c.engineering.status === 'Info Requested' && (
                  <div className="pt-1">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('engineeringAccept')}>
                      Information received — Accept
                    </Button>
                  </div>
                )}
                {isActive && c.engineering.status === 'Redirected' && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('engineeringAccept')}>
                      Accept
                    </Button>
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('engineeringRedirect')}>
                      Redirect again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Partner panel */}
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">External Partner</h3>
            {!c.partner.partnerName ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-charcoal-soft">Not yet involved.</p>
                {isActive && (
                  <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('addPartner')}>
                    Add External Partner
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-charcoal">{c.partner.partnerName}</span>
                  <Badge tone="neutral">SIMULATED INTEGRATION — Partner Queue</Badge>
                </div>
                <p className="text-charcoal-soft">Reference: {c.partner.caseRef}</p>
                <p className="text-charcoal-soft">Internal owner: {c.partner.internalOwner}</p>
                <p className="text-charcoal-soft">Impact sent: {c.partner.impactSent}</p>
                <div className="pt-1">
                  <DeadlineIndicator label="Next partner chase" target={c.partner.nextChase} now={now} />
                </div>
                {isActive && (
                  <div className="pt-2">
                    <Button variant="secondary" className="!py-1 text-xs" onClick={() => setModal('partnerChase')}>
                      Record New Partner Checkpoint
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification / closure */}
          {(c.status === 'Ready to Verify' || c.verifications.length > 0) && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Verification</h3>
              {c.verifications.map((v, i) => (
                <div key={i} className="mb-2 rounded-md bg-canvas px-3 py-2 text-sm">
                  <div className="font-medium text-charcoal">
                    {v.result} <span className="text-xs font-normal text-muted">— {formatDemoTime(v.timestamp)}</span>
                  </div>
                  <div className="text-charcoal-soft">{v.notes}</div>
                </div>
              ))}
              {c.status === 'Ready to Verify' && (
                <Button variant="primary" className="!py-1 text-xs" onClick={() => setModal('verify')}>
                  Verify Client Outcome
                </Button>
              )}
            </div>
          )}

          {c.closure && (
            <div className="rounded-lg border border-green-border bg-green-bg p-4">
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-green">Closed</h3>
              <p className="text-sm text-charcoal">{c.closure.resolutionSummary}</p>
              <p className="mt-1 text-xs text-charcoal-soft">Closed {formatDemoTime(c.closure.closedAt)}</p>
              {c.closure.followUpTasks.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-charcoal-soft">
                  {c.closure.followUpTasks.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {c.executiveRequest && (
            <div className="rounded-lg border border-purple-border bg-purple-bg p-4">
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-purple">
                Executive Decision Requested
              </h3>
              <p className="text-sm text-charcoal">{c.executiveRequest.decisionRequired}</p>
              <p className="mt-1 text-xs text-charcoal-soft">
                Requested by {c.executiveRequest.requestedBy} at {formatDemoTime(c.executiveRequest.requestedAt)}
              </p>
            </div>
          )}

          {c.debrief && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Debrief</h3>
              <dl className="space-y-2 text-sm">
                <DebriefRow label="What happened" value={c.debrief.whatHappened} />
                <DebriefRow label="Root cause" value={c.debrief.rootCause} />
                <DebriefRow label="Corrective actions">
                  <ul className="list-disc pl-5">
                    {c.debrief.correctiveActions.map((a) => (
                      <li key={a.id}>
                        {a.description} — {a.owner}, due {formatDemoTime(a.deadline)}
                      </li>
                    ))}
                  </ul>
                </DebriefRow>
              </dl>
            </div>
          )}
        </div>

        {/* RIGHT: controls + timeline */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Controls</h3>
            <div className="flex flex-wrap gap-1.5">
              {c.status === 'New' && (
                <Button variant="primary" onClick={() => setModal('acknowledge')}>
                  Acknowledge &amp; Classify
                </Button>
              )}
              {isActive && (
                <Button variant="secondary" onClick={() => setModal('clientUpdate')}>
                  Record Client Update
                </Button>
              )}
              {isActive && c.status !== 'New' && (c.waitingOn || c.status === 'Investigating') && (
                <Button variant="secondary" onClick={() => setModal('returnOutcome')}>
                  Return Technical Outcome
                </Button>
              )}
              {isActive && (
                <Button variant="ghost" className="border border-border-strong" onClick={() => setModal('changeSeverity')}>
                  Change Severity
                </Button>
              )}
              {isActive && !c.handover && (
                <Button variant="ghost" className="border border-border-strong" onClick={() => setModal('requestHandover')}>
                  Transfer Case Ownership
                </Button>
              )}
              {isActive && (
                <Button variant="ghost" className="border border-purple-border text-purple" onClick={() => setModal('executive')}>
                  Request Executive Decision
                </Button>
              )}
              {c.status === 'Resolved' && (
                <Button variant="primary" onClick={() => setModal('close')}>
                  Close Case
                </Button>
              )}
              {c.severity === 'P1' && (c.status === 'Resolved' || c.status === 'Closed') && !c.debrief && (
                <Button variant="secondary" onClick={() => setModal('debrief')}>
                  Create Debrief
                </Button>
              )}
            </div>
          </div>

          <Timeline c={c} />
        </div>
      </div>

      {modal === 'acknowledge' && <AcknowledgeModal c={c} onClose={() => setModal(null)} />}
      {modal === 'nextAction' && <NextActionModal c={c} onClose={() => setModal(null)} />}
      {modal === 'requestEngineering' && <RequestEngineeringModal c={c} onClose={() => setModal(null)} />}
      {modal === 'engineeringAccept' && <EngineeringAcceptModal c={c} onClose={() => setModal(null)} />}
      {modal === 'engineeringInfo' && <EngineeringRequestInfoModal c={c} onClose={() => setModal(null)} />}
      {modal === 'engineeringRedirect' && <EngineeringRedirectModal c={c} onClose={() => setModal(null)} />}
      {modal === 'addPartner' && <AddPartnerModal c={c} onClose={() => setModal(null)} />}
      {modal === 'partnerChase' && <RecordPartnerChaseModal c={c} onClose={() => setModal(null)} />}
      {modal === 'returnOutcome' && <ReturnOutcomeModal c={c} onClose={() => setModal(null)} />}
      {modal === 'verify' && <VerifyModal c={c} onClose={() => setModal(null)} />}
      {modal === 'close' && <CloseCaseModal c={c} onClose={() => setModal(null)} />}
      {modal === 'clientUpdate' && <ClientUpdateModal c={c} onClose={() => setModal(null)} />}
      {modal === 'changeSeverity' && <ChangeSeverityModal c={c} onClose={() => setModal(null)} />}
      {modal === 'changeNextActionDeadline' && (
        <ChangeDeadlineModal c={c} field="nextActionDeadline" onClose={() => setModal(null)} />
      )}
      {modal === 'changeNextClientUpdate' && (
        <ChangeDeadlineModal c={c} field="nextClientUpdate" onClose={() => setModal(null)} />
      )}
      {modal === 'requestHandover' && <RequestHandoverModal c={c} onClose={() => setModal(null)} />}
      {modal === 'acceptHandover' && <AcceptHandoverModal c={c} onClose={() => setModal(null)} />}
      {modal === 'executive' && <ExecutiveDecisionModal c={c} onClose={() => setModal(null)} />}
      {modal === 'debrief' && <DebriefModal c={c} onClose={() => setModal(null)} />}
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`text-charcoal ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  );
}

function DebriefRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-charcoal">{value ?? children}</dd>
    </div>
  );
}
