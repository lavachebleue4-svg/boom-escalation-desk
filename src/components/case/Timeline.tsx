import type { EscalationCase } from '../../types';
import { formatDemoTime } from '../../lib/time';

export function Timeline({ c }: { c: EscalationCase }) {
  const events = [...c.timeline].sort((a, b) => b.timestamp - a.timestamp);
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-charcoal">Activity Timeline</h3>
      <ol className="space-y-3 border-l border-border pl-4">
        {events.map((e) => (
          <li key={e.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-border-strong" />
            <div className="text-xs text-muted">{formatDemoTime(e.timestamp)}</div>
            <div className="text-sm text-charcoal">
              <span className="font-medium">{e.actor}</span> — {e.action}
            </div>
            {e.reason && <div className="text-xs text-charcoal-soft">{e.reason}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}
