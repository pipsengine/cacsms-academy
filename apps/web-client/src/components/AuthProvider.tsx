'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getDashboardForPlan, isPublicRoute, isAuthRoute } from '@/lib/auth/redirects';

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
  logout: () => void;
  updatePlan: (plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname() ?? '';

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

  const logout = async () => {
    setUser(null);
    await signOut({ redirect: true, callbackUrl: '/' });
  };

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
