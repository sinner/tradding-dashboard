import { LayoutDashboard, History, LineChart, Target, CandlestickChart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const links = [
  { to: '/', label: 'Dashboard', end: true, Icon: LayoutDashboard },
  { to: '/history', label: 'History', Icon: History },
  { to: '/markets', label: 'Markets', Icon: CandlestickChart },
  { to: '/studies', label: 'Studies', Icon: LineChart },
  { to: '/calibration', label: 'Calibration', Icon: Target },
] as const;

export function Header(): React.ReactNode {
  return (
    <header className="sticky top-0 z-30 border-b border-stroke/70 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <NavLink to="/" className="group flex items-baseline gap-2.5">
          <span className="relative text-lg font-semibold tracking-tight text-brand">
            BTC Reports
            <span className="absolute -right-2 top-1 size-1.5 rounded-full bg-brand animate-pulse-live" />
          </span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-ink-muted transition group-hover:text-ink sm:inline">
            Signal desk
          </span>
        </NavLink>
        <nav className="flex flex-wrap gap-1" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition duration-200',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  isActive
                    ? 'bg-brand/20 text-brand-light shadow-[inset_0_0_0_1px_rgba(130,50,240,0.35)]'
                    : 'text-ink-muted hover:bg-surface/80 hover:text-ink',
                )
              }
            >
              <link.Icon className="size-3.5 opacity-80" aria-hidden />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
