import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Level = 1 | 2 | 3 | 4;

const styles: Record<Level, string> = {
  1: 'text-3xl font-bold tracking-tight md:text-4xl',
  2: 'text-2xl font-semibold tracking-tight',
  3: 'text-xl font-semibold',
  4: 'text-base font-medium',
};

type Props = HTMLAttributes<HTMLHeadingElement> & {
  level?: Level;
  children: ReactNode;
};

export function Title({ level = 1, className, children, ...rest }: Props): ReactNode {
  const Tag = `h${level}` as const;
  return (
    <Tag className={cn('text-ink', styles[level], className)} {...rest}>
      {children}
    </Tag>
  );
}
