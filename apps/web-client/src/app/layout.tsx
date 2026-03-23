import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import AppChrome from '@/components/AppChrome';
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
  title: 'Cacsms Academy | Think Like Institutions. Trade With Precision',
  description: 'Think Like Institutions. Trade With Precision',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-white text-zinc-900 font-sans antialiased selection:bg-emerald-500/20" suppressHydrationWarning>
        <AuthProvider>
          <NotificationProvider>
            <MarketDataProvider>
              <AppChrome>{children}</AppChrome>
            </MarketDataProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
