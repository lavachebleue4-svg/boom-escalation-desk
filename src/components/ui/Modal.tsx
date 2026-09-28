import type { ReactNode } from 'react';

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/40 p-4 py-10 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-lg border border-border bg-surface shadow-xl`}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-charcoal">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-charcoal-soft">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-charcoal-soft hover:bg-canvas hover:text-charcoal"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">{children}</div>;
}
