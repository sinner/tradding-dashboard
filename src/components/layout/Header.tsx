import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  History,
  LineChart,
  Target,
  CandlestickChart,
  Wallet,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';

const links = [
  { to: '/', label: 'Dashboard', end: true, Icon: LayoutDashboard },
  { to: '/history', label: 'History', Icon: History },
  { to: '/markets', label: 'Markets', Icon: CandlestickChart },
  { to: '/studies', label: 'Studies', Icon: LineChart },
  { to: '/calibration', label: 'Calibration', Icon: Target },
  { to: '/paper-wallet', label: 'Wallet', Icon: Wallet },
] as const;

/** Matches Tailwind `md` — desktop nav takes over here. */
const DESKTOP_MQ = '(min-width: 768px)';

const desktopLinkClass = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition duration-200',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    isActive
      ? 'bg-brand/20 text-brand-light shadow-[inset_0_0_0_1px_rgba(130,50,240,0.35)]'
      : 'text-ink-muted hover:bg-surface/80 hover:text-ink',
  );

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MQ).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = (): void => setDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return desktop;
}

export function Header(): React.ReactNode {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const menuId = useId();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // If the viewport grows into desktop nav, close overlay and free page scroll.
  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  // Lock page scroll only while the full-screen menu is actually open.
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const { body } = document;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const overlay =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className={cn(
              'fixed inset-0 z-[80] flex h-dvh max-h-dvh w-full flex-col',
              'bg-app-gradient transition-[opacity,transform] duration-200 ease-out',
              open
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-2 opacity-0',
            )}
            // Keep mounted for exit animation; hide from a11y when closed.
            aria-hidden={!open}
            inert={!open ? true : undefined}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-stroke/70 px-4 py-3.5">
              <span className="relative text-lg font-semibold tracking-tight text-brand">
                BTC Reports
                <span className="absolute -right-2 top-1 size-1.5 rounded-full bg-brand" />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-stroke/70 bg-surface/60 text-ink transition hover:bg-surface"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-4 py-6"
              aria-label="Mobile"
            >
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={'end' in link ? link.end : false}
                  tabIndex={open ? undefined : -1}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-medium transition',
                      isActive
                        ? 'bg-brand/20 text-brand-light shadow-[inset_0_0_0_1px_rgba(130,50,240,0.35)]'
                        : 'text-ink hover:bg-surface/80',
                    )
                  }
                >
                  <link.Icon className="size-5 opacity-80" aria-hidden />
                  {link.label}
                </NavLink>
              ))}
              <span className="mt-4 px-4 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                Signal desk
              </span>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <header className="sticky top-0 z-30 border-b border-stroke/70 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <NavLink to="/" className="group flex items-baseline gap-2.5">
          <span className="relative text-lg font-semibold tracking-tight text-brand">
            BTC Reports
            <span className="absolute -right-2 top-1 size-1.5 rounded-full bg-brand animate-pulse-live" />
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-ink-muted transition group-hover:text-ink sm:inline">
            Signal desk
          </span>
        </NavLink>

        <nav className="hidden flex-wrap gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={desktopLinkClass}
            >
              <link.Icon className="size-3.5 opacity-80" aria-hidden />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={menuId}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-stroke/70 bg-surface/60 text-ink transition hover:bg-surface md:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

      {/* Only mount/show overlay for narrow viewports; desktop uses inline nav. */}
      {!isDesktop ? overlay : null}
    </header>
  );
}
