'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getDashboardForPlan, isPublicRoute, isAuthRoute } from '@/lib/auth/redirects';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Administrator' | 'User';
  country: string;
  plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader' | 'Institutional';
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updatePlan: (plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader' | 'Institutional') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname() || '/';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json().catch(() => null);
        setUser((data && 'user' in data ? (data as any).user : null) ?? null);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const normalizedPath = pathname || '/';
      const isLegal = normalizedPath.startsWith('/legal');
      const isPublic = isPublicRoute(normalizedPath) || isLegal;
      const isAuth = isAuthRoute(normalizedPath);

      // Redirect unauthenticated users to /landing
      if (!user && !isPublic) {
        router.push('/landing');
      }
      // Redirect authenticated users to correct dashboard based on their plan
      else if (user && isAuth) {
        const correctDashboard = getDashboardForPlan(user.plan);
        router.push(correctDashboard);
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    const correctDashboard = getDashboardForPlan(userData.plan as any);
    router.push(correctDashboard);
  };

  const logout = async () => {
    setUser(null);
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const updatePlan = (plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader' | 'Institutional') => {
    if (user) {
      setUser({ ...user, plan });
      const correctDashboard = getDashboardForPlan(plan as any);
      router.push(correctDashboard);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updatePlan }}>
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
