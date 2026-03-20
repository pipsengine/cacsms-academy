'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { BookOpen, Lock } from 'lucide-react';

export default function AcademyAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '/our-courses';

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <BookOpen className="h-7 w-7 animate-pulse text-teal-600" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Loading your learning space…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
            <Lock className="h-7 w-7 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
