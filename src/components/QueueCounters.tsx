import type { QueueFilter } from './QueueFilters';

export function QueueCounters({
  counters,
  onSelect,
}: {
  counters: { critical: number; needsOwner: number; waitingOnPartner: number; clientUpdateDue: number };
  onSelect: (f: QueueFilter) => void;
}) {
  const items: { label: string; value: number; filter: QueueFilter; tone: string }[] = [
    { label: 'Critical', value: counters.critical, filter: 'P1', tone: 'text-red' },
    { label: 'Needs Owner', value: counters.needsOwner, filter: 'Needs Owner', tone: 'text-charcoal' },
    { label: 'Waiting on Partner', value: counters.waitingOnPartner, filter: 'Waiting on Partner', tone: 'text-amber' },
    { label: 'Client Update Due', value: counters.clientUpdateDue, filter: 'Client Update Due', tone: 'text-charcoal' },
  ];
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <button
          key={it.label}
          onClick={() => onSelect(it.filter)}
          className="rounded-lg border border-border bg-surface px-4 py-3 text-left hover:border-border-strong"
        >
          <div className={`text-2xl font-semibold tabular-nums ${it.tone}`}>{it.value}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">{it.label}</div>
        </button>
      ))}
    </div>
  );
}
