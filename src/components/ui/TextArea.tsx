import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, hint, error, className, id, rows = 4, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label className="flex flex-col gap-1.5 text-sm">
        {label ? <span className="font-medium text-ink">{label}</span> : null}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
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
TextArea.displayName = 'TextArea';
