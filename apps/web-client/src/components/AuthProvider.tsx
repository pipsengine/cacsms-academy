'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getDashboardForPlan, isPublicRoute, isAuthRoute } from '@/lib/auth/redirects';

const DEFAULT_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_INACTIVITY_WARNING_WINDOW_MS = 30 * 1000;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

const INACTIVITY_TIMEOUT_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS,
  DEFAULT_INACTIVITY_TIMEOUT_MS,
);
const INACTIVITY_WARNING_WINDOW_MS = parsePositiveInt(
  process.env.NEXT_PUBLIC_INACTIVITY_WARNING_WINDOW_MS,
  DEFAULT_INACTIVITY_WARNING_WINDOW_MS,
);

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Administrator' | 'User';
  country: string;
  plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader';
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  refreshAuth: () => Promise<void>;
  logout: (callbackUrl?: string) => Promise<void>;
  updatePlan: (plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [warningSecondsRemaining, setWarningSecondsRemaining] = useState<number | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityDeadlineRef = useRef<number | null>(null);
  const resetSessionActivityRef = useRef<(() => void) | null>(null);
  const isLoggingOutRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname() ?? '';

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearWarningTimer = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const clearWarningCountdown = useCallback(() => {
    if (warningCountdownIntervalRef.current) {
      clearInterval(warningCountdownIntervalRef.current);
      warningCountdownIntervalRef.current = null;
    }
    setWarningSecondsRemaining(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      const rawUser = (data && 'user' in data ? (data as any).user : null) ?? null;
      const normalizedUser = rawUser
        ? {
            ...rawUser,
            plan: rawUser.plan === 'Institutional' ? 'ProTrader' : rawUser.plan,
          }
        : null;
      setUser(normalizedUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading || !pathname) {
      return;
    }

    const isLegal = pathname.startsWith('/legal');
    const isPublic = isPublicRoute(pathname) || isLegal;
    const isAuth = isAuthRoute(pathname);

    if (!user && !isPublic) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user && isAuth) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    router.push('/');
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const logout = useCallback(async (callbackUrl = '/') => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;
    clearInactivityTimer();
    clearWarningTimer();
    clearWarningCountdown();
    inactivityDeadlineRef.current = null;
    setUser(null);

    try {
      await signOut({ redirect: true, callbackUrl });
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [clearInactivityTimer, clearWarningTimer, clearWarningCountdown]);

  useEffect(() => {
    if (!user) {
      clearInactivityTimer();
      clearWarningTimer();
      clearWarningCountdown();
      inactivityDeadlineRef.current = null;
      return;
    }

    const updateWarningCountdown = () => {
      const deadline = inactivityDeadlineRef.current;
      if (!deadline) {
        setWarningSecondsRemaining(null);
        return;
      }

      const remainingMs = Math.max(0, deadline - Date.now());
      setWarningSecondsRemaining(Math.ceil(remainingMs / 1000));
    };

    const startWarningCountdown = () => {
      clearWarningCountdown();
      updateWarningCountdown();
      warningCountdownIntervalRef.current = setInterval(updateWarningCountdown, 1000);
    };

    const resetSessionActivity = () => {
      clearInactivityTimer();
      clearWarningTimer();
      clearWarningCountdown();
      inactivityDeadlineRef.current = Date.now() + INACTIVITY_TIMEOUT_MS;

      inactivityTimerRef.current = setTimeout(() => {
        void logout('/login');
      }, INACTIVITY_TIMEOUT_MS);

      warningTimerRef.current = setTimeout(() => {
        startWarningCountdown();
      }, INACTIVITY_TIMEOUT_MS - INACTIVITY_WARNING_WINDOW_MS);
    };

    resetSessionActivityRef.current = resetSessionActivity;

    const activityEvents: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetSessionActivity);
    });
    document.addEventListener('visibilitychange', resetSessionActivity);

    resetSessionActivity();

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetSessionActivity);
      });
      document.removeEventListener('visibilitychange', resetSessionActivity);
      clearInactivityTimer();
      clearWarningTimer();
      clearWarningCountdown();
      inactivityDeadlineRef.current = null;
      resetSessionActivityRef.current = null;
    };
  }, [user, logout, clearInactivityTimer, clearWarningTimer, clearWarningCountdown]);

  const updatePlan = (plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader') => {
    if (user) {
      setUser({ ...user, plan });
      const correctDashboard = getDashboardForPlan(plan as any);
      router.push(correctDashboard);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, refreshAuth, logout, updatePlan }}>
      {children}
      {user && warningSecondsRemaining !== null && warningSecondsRemaining > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-zinc-900">Session Expiring Soon</h2>
            <p className="mt-2 text-sm text-zinc-600">
              You will be signed out in <span className="font-semibold text-amber-700">{warningSecondsRemaining}s</span> due to inactivity.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetSessionActivityRef.current?.();
                }}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={() => {
                  void logout('/login');
                }}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Sign Out Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
