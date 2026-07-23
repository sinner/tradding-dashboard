import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label className="flex flex-col gap-1.5 text-sm">
        {label ? <span className="font-medium text-ink">{label}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-xl border border-stroke bg-bg px-3 py-2 text-ink outline-none transition',
            'placeholder:text-ink-muted focus:border-brand',
            error && 'border-accent',
            className,
          )}
          {...rest}
        />
        {error ? <span className="text-xs text-accent">{error}</span> : null}
        {!error && hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
      </label>
    );
  },
);
TextInput.displayName = 'TextInput';
