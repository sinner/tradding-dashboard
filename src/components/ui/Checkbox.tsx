import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, Props>(
  ({ label, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name ?? label;
    return (
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn('size-4 rounded border-stroke bg-bg accent-brand', className)}
          {...rest}
        />
        {label}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';
