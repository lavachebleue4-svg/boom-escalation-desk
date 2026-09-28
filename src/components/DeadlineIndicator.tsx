import { Badge } from './ui/Badge';
import { formatDemoTime, formatRelative } from '../lib/time';

/**
 * Colors a deadline/timestamp relative to demo "now":
 * red = overdue, amber = approaching, blue = healthy and comfortably ahead.
 */
export function DeadlineIndicator({
  label,
  target,
  now,
  approachingWindowMs = 15 * 60_000,
}: {
  label: string;
  target: number | undefined;
  now: number;
  approachingWindowMs?: number;
}) {
  if (!target) {
    return (
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-charcoal-soft">{label}</span>
        <Badge tone="red">Not set</Badge>
      </div>
    );
  }
  const diff = target - now;
  const tone = diff < 0 ? 'red' : diff <= approachingWindowMs ? 'amber' : 'blue';

  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-charcoal-soft">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-charcoal">{formatDemoTime(target)}</span>
        <Badge tone={tone}>{formatRelative(target, now)}</Badge>
      </span>
    </div>
  );
}
