function Step({
  title,
  subtitle,
  tone = 'neutral',
}: {
  title: string;
  subtitle?: string;
  tone?: 'neutral' | 'blue' | 'amber' | 'green' | 'purple';
}) {
  const toneClasses: Record<string, string> = {
    neutral: 'border-border-strong bg-surface',
    blue: 'border-blue-border bg-blue-bg',
    amber: 'border-amber-border bg-amber-bg',
    green: 'border-green-border bg-green-bg',
    purple: 'border-purple-border bg-purple-bg',
  };
  return (
    <div className={`rounded-md border px-3 py-2 text-center shadow-sm ${toneClasses[tone]}`}>
      <div className="text-[13px] font-semibold leading-tight text-charcoal">{title}</div>
      {subtitle && <div className="mt-0.5 text-[11px] leading-tight text-charcoal-soft">{subtitle}</div>}
    </div>
  );
}

function Arrow({ vertical = true }: { vertical?: boolean }) {
  return (
    <div className={`flex items-center justify-center text-border-strong ${vertical ? 'h-5' : 'w-5'}`}>
      <span className="text-lg leading-none">{vertical ? '↓' : '→'}</span>
    </div>
  );
}

export function ProcessDiagram() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      {/* Spine */}
      <div className="mx-auto flex max-w-xs flex-col items-stretch">
        <Step title="CLIENT / AI SUPPORT" subtitle="AI answers first in the client channel" tone="purple" />
        <Arrow />
        <Step title="SUPPORT HUMAN REVIEW" subtitle="A human notices the escalation trigger" />
        <Arrow />
        <Step title="CLASSIFY IMPACT" subtitle="Confirm impact, choose provisional severity" />
        <Arrow />
        <Step title="ASSIGN OWNER + NEXT ACTION" subtitle="Owner, next action, deadline — always" tone="blue" />
        <Arrow />
        <Step title="DO WE NEED SPECIALIST HELP?" tone="amber" />
      </div>

      {/* Fork */}
      <div className="relative mx-auto mt-1 grid max-w-4xl grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">No</span>
          <Arrow />
          <div className="flex w-56 flex-col items-stretch">
            <Step title="Support continues" tone="blue" />
            <Arrow />
            <Step title="Support verifies" />
            <Arrow />
            <Step title="Close" tone="green" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">Yes</span>
          <Arrow />
          <div className="flex w-72 flex-col items-stretch">
            <Step title="Engineering / Integrations accepts" subtitle="Explicit acceptance — never a silent queue" tone="blue" />
            <Arrow />
            <Step title="External partner needed?" tone="amber" />
          </div>

          <div className="mt-1 grid w-72 grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">No</span>
              <Arrow />
              <div className="flex w-full flex-col items-stretch">
                <Step title="Technical work" />
                <Arrow />
                <Step title="Return outcome to Support" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">Yes</span>
              <Arrow />
              <div className="flex w-full flex-col items-stretch">
                <Step title="Partner case" subtitle="SIMULATED INTEGRATION" />
                <Arrow />
                <Step title="Follow-up checkpoint" tone="amber" />
                <Arrow />
                <Step title="Technical outcome" />
              </div>
            </div>
          </div>

          <Arrow />
          <div className="flex w-56 flex-col items-stretch">
            <Step title="Support verifies" />
            <Arrow />
            <Step title="Close" tone="green" />
          </div>
        </div>
      </div>

      {/* Bottom continuous bar */}
      <div className="relative mt-8 rounded-md border border-blue-border bg-blue-bg px-4 py-3">
        <div className="text-center text-xs font-semibold uppercase tracking-wide text-blue">
          Client communication continues throughout
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-blue-border bg-surface px-2.5 py-1 text-[11px] font-medium text-blue">
            Next action
          </span>
          <span className="rounded-full border border-blue-border bg-surface px-2.5 py-1 text-[11px] font-medium text-blue">
            Deadline
          </span>
          <span className="rounded-full border border-blue-border bg-surface px-2.5 py-1 text-[11px] font-medium text-blue">
            Next client update
          </span>
        </div>
      </div>
    </div>
  );
}
