/**
 * Determines the correct dashboard route based on user's subscription plan
 */
export function getDashboardForPlan(plan: 'Free' | 'Professional' | 'Premium' | undefined): string {
  if (!plan) return '/currency-strength'; // Default dashboard

  switch (plan) {
    case 'Free':
      // Free plan can only access currency strength
      return '/currency-strength';
    case 'Professional':
      // Professional plan has access to channel scanner + currency strength
      // Start with channel scanner for professional experience
      return '/channel-scanner';
    case 'Premium':
      // Premium plan has full access - start with opportunities/radar
      return '/opportunities';
    default:
      return '/currency-strength';
  }
}

/**
 * All protected dashboard routes that require authentication
 */
export const DASHBOARD_ROUTES = [
  '/currency-strength',
  '/channel-scanner',
  '/breakout-engine',
  '/liquidity-intel',
  '/opportunities',
  '/configuration',
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
  return ['/login', '/register', '/landing', '/'].includes(path);
}
