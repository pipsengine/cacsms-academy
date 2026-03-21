'use client';

import { usePathname } from 'next/navigation';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

const dashboardPrefixes = [
  '/command-center',
  '/currency-strength',
  '/channel-scanner',
  '/breakout-engine',
  '/liquidity-intel',
  '/opportunities',
  '/configuration',
  '/alert-history',
  '/admin',
  '/daily-tips',
  '/our-courses',
  '/weekly-analysis',
  '/profile',
  '/ai-prompts',
  '/cot-intelligence',
];

function isDashboardRoute(pathname: string) {
  return dashboardPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const dashboardRoute = isDashboardRoute(pathname);

  return (
    <>
      {!dashboardRoute && <SiteHeader />}
      {children}
      <SiteFooter />
    </>
  );
}