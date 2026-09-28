import { useStore } from '../state/store';
import { formatClock } from '../lib/time';
import { MIN, HOUR } from '../lib/time';
import { ALL_ROLES, ROLE_TITLES } from '../lib/roles';
import type { RoleName } from '../types';
import { Button } from './ui/Button';

const ADVANCE_BUTTONS = [
  { label: '+15 Minutes', ms: 15 * MIN },
  { label: '+30 Minutes', ms: 30 * MIN },
  { label: '+1 Hour', ms: 1 * HOUR },
  { label: '+4 Hours', ms: 4 * HOUR },
];

export function ControlBar({ onOpenCase }: { onOpenCase: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const { demo, automation } = state;

  return (
    <div className="border-b border-border bg-charcoal/[0.02]">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Demo Time</span>
          <span className="rounded-md bg-surface border border-border-strong px-2.5 py-1 text-sm font-medium text-charcoal tabular-nums">
            {formatClock(demo.demoTimeMs)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {ADVANCE_BUTTONS.map((b) => (
            <Button
              key={b.label}
              variant="ghost"
              className="!px-2 !py-1 text-xs border border-border-strong"
              onClick={() => dispatch({ type: 'ADVANCE_TIME', deltaMs: b.ms })}
            >
              {b.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="!px-2 !py-1 text-xs border border-border-strong"
            onClick={() => dispatch({ type: 'JUMP_TO_NEXT_CHECKPOINT' })}
            title="Jump to the nearest upcoming deadline across all active cases"
          >
            Next Checkpoint
          </Button>
        </div>

        {automation.healthCheckFailed && (
          <span className="flex items-center gap-1.5 rounded-full border border-red-border bg-red-bg px-2.5 py-1 text-xs font-medium text-red">
            ● Automation health check failed
          </span>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            className="!px-3"
            onClick={() => {
              dispatch({ type: 'GUIDED_DEMO_START' });
              onOpenCase('case-main');
            }}
          >
            ▶ Run Guided Demo
          </Button>

          <label className="flex items-center gap-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">View As</span>
            <select
              value={demo.role}
              onChange={(e) => dispatch({ type: 'SET_ROLE', role: e.target.value as RoleName })}
              className="rounded-md border border-border-strong bg-surface px-2 py-1 text-sm text-charcoal"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r} — {ROLE_TITLES[r]}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant={demo.presentationMode ? 'primary' : 'secondary'}
            onClick={() => dispatch({ type: 'TOGGLE_PRESENTATION_MODE' })}
          >
            {demo.presentationMode ? '✓ Presentation Mode' : 'Presentation Mode'}
          </Button>
        </div>
      </div>
    </div>
  );
}
