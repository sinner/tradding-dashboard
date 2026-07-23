import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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

type PanelPos = { top: number; left: number; width: number };

const PANEL_MAX = 320;
const VIEW_PAD = 8;

function placePanel(anchor: DOMRect): PanelPos {
  const width = Math.min(PANEL_MAX, window.innerWidth - VIEW_PAD * 2);
  let left = anchor.left;
  if (left + width > window.innerWidth - VIEW_PAD) {
    left = window.innerWidth - VIEW_PAD - width;
  }
  if (left < VIEW_PAD) left = VIEW_PAD;
  return { top: anchor.bottom + 8, left, width };
}

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
  const [pos, setPos] = useState<PanelPos | null>(null);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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

  const syncPos = (): void => {
    const el = rootRef.current;
    if (!el) return;
    setPos(placePanel(el.getBoundingClientRect()));
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    syncPos();
    const onReposition = (): void => syncPos();
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open || mode !== 'click') return;
    const onPointer = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
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

  const panel =
    open && pos
      ? createPortal(
          <div
            ref={panelRef}
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
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className={cn(
              'fixed z-[100] rounded-xl border border-stroke/80 bg-bg-deep p-3 shadow-glow',
              'animate-fade-in text-left',
            )}
          >
            <p className="mb-1.5 text-sm font-semibold text-ink">{title}</p>
            <div className="space-y-2 text-xs leading-relaxed text-ink-muted">
              {children}
            </div>
          </div>,
          document.body,
        )
      : null;

  const hoverProps =
    mode === 'hover'
      ? {
          onPointerEnter: () => {
            clearClose();
            setOpen(true);
          },
          onPointerLeave: scheduleClose,
        }
      : {};

  if (variant === 'text') {
    return (
      <div ref={rootRef} className={cn('relative inline-flex', className)} {...hoverProps}>
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
      </div>
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
        {...hoverProps}
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
