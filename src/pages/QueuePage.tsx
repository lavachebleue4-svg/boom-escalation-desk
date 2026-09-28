import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { PrincipleBanner } from '../components/PrincipleBanner';
import { QueueCounters } from '../components/QueueCounters';
import { QueueFilters, type QueueFilter } from '../components/QueueFilters';
import { CaseCard } from '../components/CaseCard';
import { AutomationMonitor } from '../components/AutomationMonitor';
import { getStuckFlags, isActive, queueCounters } from '../state/derive';
import { SEVERITY_ORDER } from '../lib/severity';
import type { EscalationCase } from '../types';

function urgencyKey(c: EscalationCase, now: number) {
  const flags = getStuckFlags(c, now);
  const tier = flags.anyStuck ? 0 : 1;
  const severityRank = SEVERITY_ORDER.indexOf(c.severity);
  const deadlines = [c.nextActionDeadline, c.nextClientUpdate, c.partner.nextChase].filter(
    (v): v is number => typeof v === 'number',
  );
  const nearest = deadlines.length ? Math.min(...deadlines) : Infinity;
  return [tier, severityRank, nearest] as const;
}

export function QueuePage({ onOpenCase }: { onOpenCase: (id: string) => void }) {
  const { state } = useStore();
  const [filter, setFilter] = useState<QueueFilter>('All');
  const now = state.demo.demoTimeMs;

  const counters = queueCounters(state, now);

  const cases = useMemo(() => {
    const all = Object.values(state.cases);
    const filtered = all.filter((c) => {
      if (filter === 'All') return true;
      if (filter === 'P1' || filter === 'P2' || filter === 'P3') return c.severity === filter;
      const flags = getStuckFlags(c, now);
      if (filter === 'Overdue') return flags.overdueNextAction || flags.missedAcknowledgement;
      if (filter === 'Waiting on Partner') return c.status === 'Waiting on Partner';
      if (filter === 'Needs Owner') return flags.noOwner || c.status === 'New';
      if (filter === 'Client Update Due') return flags.missedClientUpdate;
      return true;
    });
    return filtered.sort((a, b) => {
      const ka = urgencyKey(a, now);
      const kb = urgencyKey(b, now);
      for (let i = 0; i < ka.length; i++) {
        if (ka[i] !== kb[i]) return (ka[i] as number) - (kb[i] as number);
      }
      return a.reportedAt - b.reportedAt;
    });
  }, [state.cases, filter, now]);

  const activeCases = cases.filter(isActive);
  const closedCases = cases.filter((c) => !isActive(c));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-charcoal">Escalation Queue</h1>
      <p className="mt-1 text-sm text-charcoal-soft">Client issues requiring coordinated follow-through.</p>

      <div className="mt-5">
        <PrincipleBanner />
      </div>

      <QueueCounters counters={counters} onSelect={setFilter} />
      <AutomationMonitor onOpenCase={onOpenCase} />

      <div className="mb-3 flex items-center justify-between">
        <QueueFilters active={filter} onChange={setFilter} />
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Sorted: most urgent first</span>
      </div>

      <div className="space-y-2.5">
        {activeCases.map((c) => (
          <CaseCard key={c.id} c={c} now={now} onOpen={() => onOpenCase(c.id)} />
        ))}
        {activeCases.length === 0 && (
          <div className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-sm text-muted">
            No cases match this filter.
          </div>
        )}
      </div>

      {closedCases.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-charcoal-soft">
            Resolved &amp; closed ({closedCases.length})
          </summary>
          <div className="mt-2.5 space-y-2.5">
            {closedCases.map((c) => (
              <CaseCard key={c.id} c={c} now={now} onOpen={() => onOpenCase(c.id)} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
