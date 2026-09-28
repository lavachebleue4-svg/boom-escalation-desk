import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

function Wrap({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium text-charcoal">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red">{error}</span>}
    </label>
  );
}

const baseInput =
  'w-full rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm text-charcoal outline-none focus:border-blue focus:ring-1 focus:ring-blue';

export function TextField({
  label,
  error,
  hint,
  ...props
}: { label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap label={label} error={error} hint={hint}>
      <input className={`${baseInput} ${error ? 'border-red' : ''}`} {...props} />
    </Wrap>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  ...props
}: { label: string; error?: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap label={label} error={error} hint={hint}>
      <textarea rows={3} className={`${baseInput} resize-none ${error ? 'border-red' : ''}`} {...props} />
    </Wrap>
  );
}

export function SelectField({
  label,
  error,
  hint,
  children,
  ...props
}: { label: string; error?: string; hint?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap label={label} error={error} hint={hint}>
      <select className={`${baseInput} ${error ? 'border-red' : ''}`} {...props}>
        {children}
      </select>
    </Wrap>
  );
}

export function DateTimeField({
  label,
  error,
  hint,
  ...props
}: { label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap label={label} error={error} hint={hint}>
      <input type="datetime-local" className={`${baseInput} ${error ? 'border-red' : ''}`} {...props} />
    </Wrap>
  );
}
