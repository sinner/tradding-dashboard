const APP_VERSION: string | undefined = import.meta.env.VITE_APP_VERSION;

export function Footer(): React.ReactNode {
  return (
    <footer className="border-t border-stroke/60 py-6 text-center text-xs text-ink-muted">
      BTC Reports Dashboard · By JSinner (Jose Gabriel Gonzalez) - All rights reserved ·
      Version {APP_VERSION}
    </footer>
  );
}
