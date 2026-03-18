/**
 * Super Admin Access Control Utilities
 * 
 * Ensures Super Admin and Administrator roles have unrestricted access to all platform features
 */

import type { User } from '@/components/AuthProvider';

export type AccessLevel = 'scout' | 'analyst' | 'trader' | 'protrader' | 'institutional';

/**
 * Convert subscription plan to access level (0-4)
 */
export function getPlanAccessLevel(plan?: string): number {
  switch (plan) {
    case 'Scout': return 0;
    case 'Analyst': return 1;
    case 'Trader': return 2;
    case 'ProTrader': return 3;
    case 'Institutional': return 4;
    default: return -1;
  }
}

/**
 * Check if user has Super Admin/Administrator role
 * Super Admins bypass all restrictions
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'Super Admin' || user?.role === 'Administrator';
}

/**
 * Check if user can access a feature based on plan
 * Super Admin/Administrator always have access
 */
export function canAccessFeature(
  user: User | null,
  requiredAccessLevel: number
): boolean {
  if (!user) return false;
  
  // Super Admin/Administrator bypass all restrictions
  if (isSuperAdmin(user)) return true;
  
  // Check plan-based access
  const userLevel = getPlanAccessLevel(user.plan);
  return userLevel >= requiredAccessLevel;
}

/**
 * Check if usage limits apply to user
 * Super Admin/Administrator and ProTrader/Institutional have unlimited usage
 */
export function shouldCheckUsageLimits(user: User | null): boolean {
  if (!user) return true;
  
  // Super Admin and Administrator bypass limits
  if (isSuperAdmin(user)) return false;
  
  // ProTrader and Institutional have unlimited features
  if (user.plan === 'ProTrader' || user.plan === 'Institutional') return false;
  
  return true;
}

/**
 * Check if user can manage users (Super Admin/Administrator only)
 */
export function canManageUsers(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can manage subscriptions (Super Admin/Administrator only)
 */
export function canManageSubscriptions(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can manage system settings (Super Admin only)
 */
export function canManageSystemSettings(user: User | null): boolean {
  return user?.role === 'Super Admin';
}

/**
 * Check if user can access analytics (Super Admin/Administrator only)
 */
export function canAccessAnalytics(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can override rules/limits (Super Admin only)
 */
export function canOverrideRules(user: User | null): boolean {
  return user?.role === 'Super Admin';
}

/**
 * Get features visible/accessible to user
 */
export function getAccessibleFeatures(user: User | null): {
  currencyStrength: boolean;
  channelScanner: boolean;
  breakoutEngine: boolean;
  liquidityIntel: boolean;
  opportunityRadar: boolean;
  aiProbability: boolean;
  apiAccess: boolean;
  administration: boolean;
} {
  if (!user) {
    return {
      currencyStrength: false,
      channelScanner: false,
      breakoutEngine: false,
      liquidityIntel: false,
      opportunityRadar: false,
      aiProbability: false,
      apiAccess: false,
      administration: false,
    };
  }

  const isAdmin = isSuperAdmin(user);
  const planLevel = getPlanAccessLevel(user.plan);

  return {
    currencyStrength: isAdmin || planLevel >= 0, // Scout+
    channelScanner: isAdmin || planLevel >= 1, // Analyst+
    breakoutEngine: isAdmin || planLevel >= 1, // Analyst+
    liquidityIntel: isAdmin || planLevel >= 2, // Trader+
    opportunityRadar: isAdmin || planLevel >= 2, // Trader+
    aiProbability: isAdmin || planLevel >= 2, // Trader+
    apiAccess: isAdmin || planLevel >= 3, // ProTrader+
    administration: isAdmin, // Admin only
  };
}

/**
 * Assert Super Admin privileges
 * Throws error if user is not Super Admin
 */
export function assertSuperAdmin(user: User | null, context?: string): void {
  if (user?.role !== 'Super Admin') {
    throw new Error(
      `Super Admin privileges required${context ? ` for ${context}` : ''}. Current role: ${user?.role || 'None'}`
    );
  }
}

/**
 * Assert Admin privileges (Super Admin or Administrator)
 * Throws error if user doesn't have admin role
 */
export function assertAdmin(user: User | null, context?: string): void {
  if (!isSuperAdmin(user)) {
    throw new Error(
      `Admin privileges required${context ? ` for ${context}` : ''}. Current role: ${user?.role || 'None'}`
    );
  }
}
