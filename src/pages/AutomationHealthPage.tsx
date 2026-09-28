import type { ReactNode } from 'react';
import { useStore } from '../state/store';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDemoTime } from '../lib/time';

const NEVER_AUTOMATE = [
  'Declare a case resolved.',
  'Reduce severity.',
  'Promise a restoration time.',
  'Tell a client the problem is fixed.',
  'Approve compensation.',
  'Change ownership without acceptance.',
  'Escalate directly to the COO.',
  'Close the client case.',
];

export function AutomationHealthPage() {
  const { state, dispatch } = useStore();
  const { automation } = state;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-charcoal">Automation Health</h1>
      <p className="mt-1 text-sm text-charcoal-soft">
        How Operations would know if deadline monitoring quietly stopped working.
      </p>

      {automation.healthCheckFailed && (
        <div className="mt-5 rounded-lg border border-red-border bg-red-bg px-5 py-4">
          <div className="text-sm font-bold uppercase tracking-wide text-red">Automation Health Check Failed</div>
          <p className="mt-1 text-sm text-charcoal">
            Deadline monitoring has not completed successfully in the expected interval.
          </p>
          <p className="mt-2 text-sm font-medium text-charcoal">Fallback: manual queue review required.</p>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-charcoal">Stall / overdue monitor</h2>
          <dl className="space-y-2.5 text-sm">
            <Row label="Monitor status">
              <Badge tone={automation.monitorHealthy ? 'green' : 'red'}>
                {automation.monitorHealthy ? 'Healthy' : 'Stopped'}
              </Badge>
            </Row>
            <Row label="Last successful scan" value={formatDemoTime(automation.lastSuccessfulScan)} />
            <Row label="Cases scanned (last run)" value={String(automation.casesScanned)} />
            <Row label="Open alerts" value={String(state.alerts.filter((a) => !a.acknowledged).length)} />
            <Row label="Last alert created" value={formatDemoTime(automation.lastAlertCreated)} />
          </dl>
          <div className="mt-4 flex gap-2">
            {automation.monitorHealthy ? (
              <Button variant="danger" onClick={() => dispatch({ type: 'SIMULATE_AUTOMATION_FAILURE' })}>
                Simulate Automation Failure
              </Button>
            ) : (
              <Button variant="primary" onClick={() => dispatch({ type: 'RESTORE_MONITOR' })}>
                Restore Monitor
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">
            The monitor checks active cases every simulated 5 minutes and deduplicates unchanged alerts — advance
            demo time to see it run.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-charcoal">Independent health check</h2>
          <dl className="space-y-2.5 text-sm">
            <Row label="Health check status">
              <Badge tone={automation.healthCheckFailed ? 'red' : 'green'}>
                {automation.healthCheckFailed ? 'Failed' : 'Passing'}
              </Badge>
            </Row>
            <Row label="Last health check" value={formatDemoTime(automation.lastHealthCheck)} />
            <Row label="Failure simulated at" value={automation.failureSimulatedAt ? formatDemoTime(automation.failureSimulatedAt) : '—'} />
          </dl>
          <p className="mt-4 text-xs text-charcoal-soft">
            This check is logically separate from the stall monitor above: it independently watches how long it has
            been since a scan last succeeded, rather than asking the monitor to report on itself. In production this
            would be a distinct watchdog process.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-1 text-sm font-semibold text-charcoal">Human control</h2>
        <p className="mb-3 text-sm text-charcoal-soft">Automation will never automatically:</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {NEVER_AUTOMATE.map((item) => (
            <li key={item} className="flex items-start gap-2 rounded-md bg-canvas px-3 py-2 text-sm text-charcoal">
              <span className="mt-0.5 text-red">✕</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">These decisions remain human — always.</p>
      </div>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="text-charcoal-soft">{label}</dt>
      <dd className="font-medium text-charcoal">{value ?? children}</dd>
    </div>
  );
}
