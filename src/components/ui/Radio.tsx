import {
  createContext,
  useContext,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type RadioContextValue = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

const RadioContext = createContext<RadioContextValue | null>(null);

type GroupProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  label?: string;
};

export function RadioGroup({
  name,
  value,
  onChange,
  children,
  className,
  label,
}: GroupProps): ReactNode {
  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <legend className="mb-1 text-sm font-medium text-ink">{label}</legend>
      ) : null}
      <RadioContext.Provider value={{ name, value, onChange }}>
        <div className="flex flex-wrap gap-3">{children}</div>
      </RadioContext.Provider>
    </fieldset>
  );
}

type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name' | 'onChange'
> & {
  value: string;
  label: string;
};

export function Radio({ value, label, className, ...rest }: RadioProps): ReactNode {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('Radio must be used inside RadioGroup');

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={ctx.value === value}
        onChange={() => ctx.onChange(value)}
        className={cn('size-4 accent-brand', className)}
        {...rest}
      />
      {label}
    </label>
  );
}
