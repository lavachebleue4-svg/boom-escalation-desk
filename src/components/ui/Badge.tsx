import type { ReactNode } from 'react';

type Tone = 'blue' | 'amber' | 'red' | 'green' | 'purple' | 'neutral';

const toneClasses: Record<Tone, string> = {
  blue: 'bg-blue-bg text-blue border-blue-border',
  amber: 'bg-amber-bg text-amber border-amber-border',
  red: 'bg-red-bg text-red border-red-border',
  green: 'bg-green-bg text-green border-green-border',
  purple: 'bg-purple-bg text-purple border-purple-border',
  neutral: 'bg-canvas text-charcoal-soft border-border-strong',
};

export function Badge({
  tone = 'neutral',
  children,
  title,
}: {
  tone?: Tone;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
