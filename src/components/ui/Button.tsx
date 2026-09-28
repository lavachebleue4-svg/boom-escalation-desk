import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-charcoal text-white border-charcoal hover:bg-charcoal/90',
  secondary: 'bg-surface text-charcoal border-border-strong hover:bg-canvas',
  ghost: 'bg-transparent text-charcoal-soft border-transparent hover:bg-canvas',
  danger: 'bg-red text-white border-red hover:bg-red/90',
};

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
