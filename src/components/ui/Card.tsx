import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
  interactive?: boolean;
};

export function Card({
  children,
  className,
  padded = true,
  interactive = false,
  ...rest
}: Props): ReactNode {
  return (
    <div
      className={cn(
        'rounded-2xl border border-stroke/80 bg-surface/70 shadow-card backdrop-blur-sm',
        'transition duration-200',
        interactive && 'hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-glow',
        padded && 'p-4 md:p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
