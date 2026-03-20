/**
 * Determines the correct dashboard route based on user's subscription plan
 */
export function getDashboardForPlan(plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader' | 'Institutional' | undefined): string {
  switch (plan) {
    case 'Scout':
      return '/currency-strength';
    case 'Analyst':
      return '/channel-scanner';
    case 'Trader':
      return '/channel-scanner';
    case 'ProTrader':
      return '/opportunities';
    case 'Institutional':
      return '/opportunities';
    default:
      return '/currency-strength';
  }
}

/**
 * All protected dashboard routes that require authentication
 */
export const DASHBOARD_ROUTES = [
  '/command-center',
  '/currency-strength',
  '/channel-scanner',
  '/breakout-engine',
  '/liquidity-intel',
  '/opportunities',
  '/configuration',
  '/profile',
  '/alert-history',
  '/admin',
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/landing',
  '/pricing',
  '/',
] as const;

/**
 * Check if a route is a legal/policy route
 */
export function isLegalRoute(path: string): boolean {
  return path.startsWith('/legal');
}

/**
 * Check if a route is public
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path as any) || isLegalRoute(path);
}

/**
 * Check if a route is a dashboard/protected route
 */
export function isDashboardRoute(path: string): boolean {
  return DASHBOARD_ROUTES.includes(path as any);
}

/**
 * Check if a route is an auth route (login/register)
 */
export function isAuthRoute(path: string): boolean {
  return ['/login', '/register'].includes(path);
}
