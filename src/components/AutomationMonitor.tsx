import { useState } from 'react';
import { useStore } from '../state/store';
import { formatDemoTime, formatDuration } from '../lib/time';
import { Button } from './ui/Button';

/** Internal escalation cards produced by the simulated stall/overdue monitor. */
export function AutomationMonitor({ onOpenCase }: { onOpenCase: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const [showAcked, setShowAcked] = useState(false);
  const alerts = [...state.alerts].sort((a, b) => b.overdueSinceMs - a.overdueSinceMs);
  const visible = showAcked ? alerts : alerts.filter((a) => !a.acknowledged);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-5 rounded-lg border border-amber-border bg-amber-bg/40">
      <div className="flex items-center justify-between border-b border-amber-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal">Internal escalation alerts</span>
          <span className="rounded-full bg-amber text-white text-xs font-semibold px-1.5 py-0.5">
            {alerts.filter((a) => !a.acknowledged).length} open
          </span>
        </div>
        <button
          className="text-xs font-medium text-charcoal-soft underline decoration-dotted"
          onClick={() => setShowAcked((v) => !v)}
        >
          {showAcked ? 'Hide acknowledged' : 'Show acknowledged'}
        </button>
      </div>
      <div className="scrollbar-thin max-h-72 divide-y divide-amber-border overflow-y-auto">
        {visible.map((a) => {
          const c = state.cases[a.caseId];
          if (!c) return null;
          return (
            <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div>
                <button onClick={() => onOpenCase(c.id)} className="text-sm font-semibold text-charcoal hover:underline">
                  {c.client} — {c.issueTitle}
                </button>
                <div className="mt-1 grid gap-x-6 gap-y-0.5 text-xs text-charcoal-soft sm:grid-cols-2">
                  <span>
                    <span className="text-muted">Breach: </span>
                    {a.breach}
                  </span>
                  <span>
                    <span className="text-muted">Responsible owner: </span>
                    {a.responsibleOwner}
                  </span>
                  <span>
                    <span className="text-muted">How overdue: </span>
                    {formatDuration(a.overdueSinceMs)}
                  </span>
                  <span>
                    <span className="text-muted">Required next action: </span>
                    {a.requiredNextAction}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-muted">Alert created {formatDemoTime(a.createdAt)}</div>
              </div>
              {a.acknowledged ? (
                <span className="shrink-0 rounded-full border border-green-border bg-green-bg px-2 py-0.5 text-[11px] font-medium text-green">
                  Acknowledged
                </span>
              ) : (
                <Button
                  variant="secondary"
                  className="shrink-0 !py-1 text-xs"
                  onClick={() => dispatch({ type: 'ACK_ALERT', alertId: a.id })}
                >
                  Acknowledge Alert
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
