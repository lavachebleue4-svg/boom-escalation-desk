import type { EscalationCase } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/Badge';
import { DeadlineIndicator } from './DeadlineIndicator';
import { getStuckFlags } from '../state/derive';
import { formatDemoTime } from '../lib/time';

export function CaseCard({
  c,
  now,
  onOpen,
}: {
  c: EscalationCase;
  now: number;
  onOpen: () => void;
}) {
  const flags = getStuckFlags(c, now);

  return (
    <button
      onClick={onOpen}
      className={`block w-full rounded-lg border bg-surface p-4 text-left transition-shadow hover:shadow-md ${
        flags.anyStuck ? 'border-red-border' : 'border-border'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-charcoal">{c.client}</span>
            <SeverityBadge severity={c.severity} />
            <StatusBadge status={c.status} />
          </div>
          <p className="mt-0.5 text-sm text-charcoal-soft">{c.issueTitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {flags.noOwner && <Badge tone="red">Needs Owner</Badge>}
          {flags.missedAcknowledgement && <Badge tone="red">Ack Overdue</Badge>}
          {flags.overdueNextAction && <Badge tone="red">Overdue</Badge>}
          {flags.missedClientUpdate && <Badge tone="red">Client Update Due</Badge>}
          {flags.overduePartnerFollowUp && <Badge tone="red">Partner Chase Overdue</Badge>}
          {flags.missingTechnicalAcceptance && <Badge tone="red">Eng. Acceptance Overdue</Badge>}
          {c.status === 'Waiting on Engineering' && <Badge tone="amber">Waiting on Engineering</Badge>}
          {c.status === 'Waiting on Partner' && <Badge tone="amber">Waiting on Partner</Badge>}
          {c.status === 'Ready to Verify' && <Badge tone="blue">Ready to Verify</Badge>}
          {(c.status === 'Resolved' || c.status === 'Closed') && <Badge tone="green">Verified</Badge>}
          {c.handover && !c.handover.accepted && <Badge tone="purple">Handover Pending</Badge>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
        <Field label="Accountable Owner" value={c.accountableOwner ?? '—'} highlight={!c.accountableOwner} />
        <Field label="Technical Owner" value={c.technicalOwner ?? '—'} />
        <Field label="Waiting On" value={c.waitingOn ?? 'No one — active with Support'} />
        <Field label="Next Action Owner" value={c.nextActionOwner ?? '—'} />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-1 border-t border-border pt-2 sm:grid-cols-3">
        <div className="text-sm text-charcoal-soft">
          <span className="text-muted">Next action: </span>
          {c.nextAction ?? <span className="font-medium text-red">Not set</span>}
        </div>
        <DeadlineIndicator label="Next action due" target={c.nextActionDeadline} now={now} />
        <DeadlineIndicator label="Next client update" target={c.nextClientUpdate} now={now} approachingWindowMs={30 * 60_000} />
      </div>

      <p className="mt-2 text-xs text-muted">Reported {formatDemoTime(c.reportedAt)}</p>
    </button>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`truncate ${highlight ? 'font-medium text-red' : 'text-charcoal'}`}>{value}</div>
    </div>
  );
}
