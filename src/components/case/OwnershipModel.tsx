import type { EscalationCase } from '../../types';

export function OwnershipModel({ c }: { c: EscalationCase }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-3 py-2 sm:py-0 sm:pl-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue">Support</div>
          <div className="text-sm text-charcoal">owns client follow-through</div>
          <div className="mt-1 text-sm font-medium text-charcoal">{c.accountableOwner ?? '— unassigned —'}</div>
        </div>
        <div className="px-3 py-2 sm:py-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">Engineering / Integrations</div>
          <div className="text-sm text-charcoal">owns technical investigation</div>
          <div className="mt-1 text-sm font-medium text-charcoal">{c.technicalOwner ?? '— not engaged —'}</div>
        </div>
        <div className="px-3 py-2 sm:py-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">Partner</div>
          <div className="text-sm text-charcoal">owns their external action</div>
          <div className="mt-1 text-sm font-medium text-charcoal">{c.partner.partnerName ?? '— not engaged —'}</div>
        </div>
      </div>
      <div className="mt-3 rounded-md bg-blue-bg px-3 py-2 text-xs font-medium text-blue">
        Support remains accountable for client communication — always.
      </div>
    </div>
  );
}
