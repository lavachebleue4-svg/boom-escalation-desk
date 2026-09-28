import { useState } from 'react';
import { useStore } from '../state/store';
import { ConfirmDialog } from './ui/ConfirmDialog';

export type Route = 'queue' | 'process' | 'automation' | 'about';

const NAV_ITEMS: { key: Route; label: string }[] = [
  { key: 'queue', label: 'Queue' },
  { key: 'process', label: 'Process' },
  { key: 'automation', label: 'Automation Health' },
  { key: 'about', label: 'About This Demo' },
];

export function TopNav({
  route,
  onNavigate,
  presentationMode,
}: {
  route: Route;
  onNavigate: (r: Route) => void;
  presentationMode: boolean;
}) {
  const { dispatch } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-semibold tracking-tight text-charcoal">Boom Escalation Desk</span>
          {!presentationMode && (
            <span className="rounded-full border border-border-strong px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              Prototype
            </span>
          )}
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                route === item.key
                  ? 'bg-charcoal text-white'
                  : 'text-charcoal-soft hover:bg-canvas hover:text-charcoal'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="rounded-md border border-border-strong px-2.5 py-1.5 text-sm text-charcoal-soft hover:bg-canvas"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-40 mt-1 w-44 rounded-md border border-border bg-surface py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmReset(true);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-red hover:bg-red-bg"
              >
                Reset Demo
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset demo data?"
          body="This clears every case, alert, and timestamp back to the seeded starting state. This cannot be undone."
          confirmLabel="Reset Demo"
          tone="danger"
          onConfirm={() => {
            dispatch({ type: 'RESET_DEMO' });
            setConfirmReset(false);
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </header>
  );
}
