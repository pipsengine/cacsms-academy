import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { NotificationProvider } from '@/components/NotificationProvider';
import { MarketDataProvider } from '@/components/MarketDataProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'INTEL TRADER | AI Market Intelligence',
  description: 'Institutional Channel, Strength & Liquidity Intelligence System',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-white text-zinc-900 font-sans antialiased selection:bg-emerald-500/20" suppressHydrationWarning>
        <AuthProvider>
          <NotificationProvider>
            <MarketDataProvider>
              {children}
            </MarketDataProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
