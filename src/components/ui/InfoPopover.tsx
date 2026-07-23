import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  label: string;
  title: string;
  children: ReactNode;
  className?: string;
  /** `icon` = help button (click). `text` = custom trigger (hover). */
  variant?: 'icon' | 'text';
  trigger?: 'click' | 'hover';
  /** Visible trigger when variant is `text`. Defaults to `title`. */
  text?: ReactNode;
  textClassName?: string;
};

export function InfoPopover({
  label,
  title,
  children,
  className,
  variant = 'icon',
  trigger,
  text,
  textClassName,
}: Props): ReactNode {
  const mode = trigger ?? (variant === 'text' ? 'hover' : 'click');
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const clearClose = (): void => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = (): void => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open || mode !== 'click') return;
    const onPointer = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, mode]);

  useEffect(
    () => () => {
      clearClose();
    },
    [],
  );

  const panel = open ? (
    <div
      id={id}
      role="tooltip"
      aria-label={title}
      onPointerEnter={
        mode === 'hover'
          ? () => {
              clearClose();
              setOpen(true);
            }
          : undefined
      }
      onPointerLeave={mode === 'hover' ? scheduleClose : undefined}
      className={cn(
        'absolute left-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))]',
        'rounded-xl border border-stroke/80 bg-bg-deep p-3 shadow-glow',
        'animate-fade-in text-left',
      )}
    >
      <p className="mb-1.5 text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-2 text-xs leading-relaxed text-ink-muted">{children}</div>
    </div>
  ) : null;

  if (variant === 'text') {
    return (
      <span
        ref={rootRef}
        className={cn('relative inline-flex', className)}
        onPointerEnter={
          mode === 'hover'
            ? () => {
                clearClose();
                setOpen(true);
              }
            : undefined
        }
        onPointerLeave={mode === 'hover' ? scheduleClose : undefined}
      >
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-describedby={open ? id : undefined}
          onClick={mode === 'click' ? () => setOpen((v) => !v) : undefined}
          className={cn(
            'cursor-help border-b border-dotted border-current/40',
            'transition hover:border-signal',
            textClassName ?? 'text-ink-muted hover:text-signal',
            open && (textClassName ? 'opacity-100' : 'border-signal text-signal'),
          )}
        >
          {text ?? title}
        </button>
        {panel}
      </span>
    );
  }

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={
          mode === 'hover'
            ? () => {
                clearClose();
                setOpen(true);
              }
            : undefined
        }
        onPointerLeave={mode === 'hover' ? scheduleClose : undefined}
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-full',
          'border border-stroke/80 bg-bg/60 text-ink-muted',
          'transition hover:border-signal/50 hover:text-signal',
          open && 'border-signal/60 text-signal',
        )}
      >
        <HelpCircle className="size-3.5" aria-hidden />
      </button>
      {panel}
    </div>
  );
}
