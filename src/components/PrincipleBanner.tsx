export function PrincipleBanner() {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-blue-border bg-blue-bg px-4 py-3">
        <p className="text-sm leading-snug text-charcoal">
          <span className="font-semibold">Escalation changes who helps solve the problem.</span>{' '}
          It does not remove ownership of the client outcome.
        </p>
      </div>
      <div className="rounded-lg border border-border-strong bg-surface px-4 py-3">
        <p className="text-sm leading-snug text-charcoal">
          Every active escalation must have an <span className="font-semibold">owner</span>, a{' '}
          <span className="font-semibold">next action</span>, a <span className="font-semibold">deadline</span>,
          and a <span className="font-semibold">next client update</span>.
        </p>
      </div>
    </div>
  );
}
