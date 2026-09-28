export type QueueFilter =
  | 'All'
  | 'P1'
  | 'P2'
  | 'P3'
  | 'Overdue'
  | 'Waiting on Partner'
  | 'Needs Owner'
  | 'Client Update Due';

const FILTERS: QueueFilter[] = [
  'All',
  'P1',
  'P2',
  'P3',
  'Overdue',
  'Waiting on Partner',
  'Needs Owner',
  'Client Update Due',
];

export function QueueFilters({
  active,
  onChange,
}: {
  active: QueueFilter;
  onChange: (f: QueueFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            active === f
              ? 'border-charcoal bg-charcoal text-white'
              : 'border-border-strong bg-surface text-charcoal-soft hover:border-charcoal'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
