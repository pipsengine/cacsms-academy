'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Administrator' | 'User';
  country: string;
  plan: 'Free' | 'Professional' | 'Premium';
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updatePlan: (plan: 'Free' | 'Professional' | 'Premium') => void;
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
      const publicRoutes = ['/login', '/register', '/landing', '/pricing', '/'];
      const normalizedPath = pathname || '/';
      const isLegalRoute = normalizedPath.startsWith('/legal');
      const isPublicRoute = publicRoutes.includes(normalizedPath) || isLegalRoute;
      const isAuthRoute = ['/login', '/register', '/landing', '/'].includes(normalizedPath);

      if (!user && !isPublicRoute) {
        router.push('/landing');
      } else if (user && isAuthRoute) {
        router.push('/currency-strength');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    router.push('/currency-strength');
  };

  const logout = async () => {
    setUser(null);
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const updatePlan = (plan: 'Free' | 'Professional' | 'Premium') => {
    if (user) {
      setUser({ ...user, plan });
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
