import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { Header } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Pulse — Trading Community',
    template: '%s | Pulse',
  },
  description:
    'Where traders discover ideas, discuss stocks, and stay ahead of the market. Join the best online community for active traders.',
  openGraph: {
    title: 'Pulse — Trading Community',
    description:
      'Where traders discover ideas, discuss stocks, and stay ahead of the market.',
    siteName: 'Pulse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse — Trading Community',
    description:
      'Where traders discover ideas, discuss stocks, and stay ahead of the market.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-950 text-white`}>
        <Providers>
          <div className="relative min-h-screen bg-gray-950">
            {/* Background effects */}
            <div className="fixed inset-0 bg-grid pointer-events-none" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-glow pointer-events-none" />

            <Header />

            <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
