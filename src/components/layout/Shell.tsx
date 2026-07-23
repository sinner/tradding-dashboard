import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

type Props = { children: ReactNode };

export function Shell({ children }: Props): ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-app-gradient font-sans text-ink antialiased">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
