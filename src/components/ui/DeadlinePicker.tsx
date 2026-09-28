import { DateTimeField } from './Field';
import { toLocalInputValue, fromLocalInputValue, formatDemoTime, MIN, HOUR, DAY } from '../../lib/time';

const OFFSETS: { label: string; ms: number }[] = [
  { label: '+15m', ms: 15 * MIN },
  { label: '+30m', ms: 30 * MIN },
  { label: '+1h', ms: 1 * HOUR },
  { label: '+4h', ms: 4 * HOUR },
  { label: '+1d', ms: 1 * DAY },
];

export function DeadlinePicker({
  label,
  now,
  value,
  onChange,
  error,
}: {
  label: string;
  now: number;
  value: number | undefined;
  onChange: (ms: number) => void;
  error?: string;
}) {
  return (
    <div className="mb-3">
      <span className="mb-1 block text-sm font-medium text-charcoal">{label}</span>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {OFFSETS.map((o) => (
          <button
            type="button"
            key={o.label}
            onClick={() => onChange(now + o.ms)}
            className="rounded-full border border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-charcoal-soft hover:border-blue hover:text-blue"
          >
            {o.label}
          </button>
        ))}
      </div>
      <DateTimeField
        label="Or pick an exact time"
        value={value ? toLocalInputValue(value) : ''}
        onChange={(e) => onChange(fromLocalInputValue(e.target.value))}
        error={error}
      />
      {value && <p className="-mt-2 text-xs text-muted">Set for {formatDemoTime(value)} (demo time).</p>}
    </div>
  );
}
