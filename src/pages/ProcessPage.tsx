import { ProcessDiagram } from '../components/ProcessDiagram';
import { PrincipleBanner } from '../components/PrincipleBanner';
import { SEVERITY_MODEL } from '../lib/severity';
import { SEVERITY_ORDER } from '../lib/severity';

export function ProcessPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-charcoal">When something gets stuck</h1>
      <p className="mt-1 text-sm text-charcoal-soft">
        The proposed escalation process — how a client issue moves from first response to a verified close.
      </p>

      <div className="mt-5">
        <PrincipleBanner />
      </div>

      <ProcessDiagram />

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-charcoal">Proposed operating targets by severity</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Human acknowledgement</th>
                <th className="py-2 pr-4">Owner + next action</th>
                <th className="py-2 pr-4">Client update cadence</th>
              </tr>
            </thead>
            <tbody>
              {SEVERITY_ORDER.map((s) => (
                <tr key={s} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-medium text-charcoal">{SEVERITY_MODEL[s].label}</td>
                  <td className="py-2 pr-4 text-charcoal-soft">{SEVERITY_MODEL[s].acknowledgeLabel}</td>
                  <td className="py-2 pr-4 text-charcoal-soft">{SEVERITY_MODEL[s].ownerPlanLabel}</td>
                  <td className="py-2 pr-4 text-charcoal-soft">{SEVERITY_MODEL[s].updateCadenceLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          These are proposed operating targets, not existing Boom SLAs. They exist to make "stuck" visible and
          debatable — not to imply a contractual commitment.
        </p>
      </div>
    </div>
  );
}
