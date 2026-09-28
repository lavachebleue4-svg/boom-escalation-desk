const ITEMS = [
  { n: '01', title: 'What starts it', body: 'Named triggers, and Support ownership of noticing them.' },
  { n: '02', title: 'Steps / owners / deadlines', body: 'A visible workflow with accountable owners and proposed timing at every step.' },
  { n: '03', title: 'Where it lives', body: 'A persistent escalation case record, not a chat message that scrolls away.' },
  { n: '04', title: 'Finished / stalled', body: 'A verification gate before closure, plus continuous deadline monitoring.' },
  { n: '05', title: 'Deliberately left out', body: 'Default COO escalation — named functional leads act first.' },
  { n: '06', title: 'Automation', body: 'A deadline/stall monitor with explicit human controls and its own health monitoring.' },
];

export function AssessmentCoverage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-charcoal">How this prototype answers the brief</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((it) => (
          <div key={it.n} className="rounded-md bg-canvas px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted">{it.n}</span>
              <span className="text-sm font-semibold text-charcoal">{it.title}</span>
            </div>
            <p className="mt-1 text-sm text-charcoal-soft">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
