import { AssessmentCoverage } from '../components/AssessmentCoverage';

const LEFT_OUT = [
  {
    title: 'Default COO escalation',
    reason:
      'Operational escalation should work through named roles and functional leads before requiring executive chasing.',
  },
  {
    title: 'Autonomous client messaging',
    reason: 'Severity, business impact, restoration estimates, and resolution statements require human verification.',
  },
  {
    title: "Replacing Boom's existing ticket and engineering systems",
    reason: 'This prototype demonstrates the process and control layer, not unnecessary tool replacement.',
  },
  {
    title: 'AI root-cause conclusions',
    reason: 'A debrief should distinguish verified facts from assumptions.',
  },
];

const PRODUCTION_REQUIREMENTS = [
  'Authentication / authorization',
  'Persistent database',
  'Real support-ticket integration',
  'Engineering tracker integration',
  'Slack integration',
  'External partner integration where available',
  'Server-side scheduler',
  'Independent monitoring',
  'Audit and security review',
  'Agreed coverage model and SLAs',
];

export function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">About This Demo</h1>
        <p className="mt-1 max-w-2xl text-sm text-charcoal-soft">
          Boom Escalation Desk is a working demonstration of a proposed operational process for handling client
          problems that become stuck. It is not a replacement helpdesk, CRM, engineering tracker, or production
          incident-management platform — it makes the <em>process</em> visible: ownership, next actions, deadlines,
          and verification.
        </p>
      </div>

      <AssessmentCoverage />

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-charcoal">What I deliberately left out</h2>
        <div className="space-y-3">
          {LEFT_OUT.map((item) => (
            <div key={item.title} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="text-sm font-semibold text-charcoal">{item.title}</div>
              <div className="text-sm text-charcoal-soft">{item.reason}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-charcoal">What is simulated</h2>
        <p className="text-sm text-charcoal-soft">
          Slack, the support ticketing system, the engineering issue tracker, and the external partner queue are all
          labelled <span className="font-medium text-charcoal">SIMULATED INTEGRATION</span> throughout the app.
          Nothing here sends a real message or writes to a real external system — every "next" step is demo data
          held in this browser.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-charcoal">What production would require</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {PRODUCTION_REQUIREMENTS.map((r) => (
            <li key={r} className="text-sm text-charcoal-soft before:mr-2 before:text-muted before:content-['—']">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
