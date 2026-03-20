'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, CreditCard, LayoutDashboard, LogOut, Settings, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

type UserAccountMenuProps = {
  variant?: 'light' | 'dark';
  subtitle?: string;
};

const variantStyles = {
  light: {
    button: 'border-zinc-200 bg-white/90 text-zinc-900 hover:bg-white',
    subtleText: 'text-zinc-500',
    chevron: 'text-zinc-500',
    avatar: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    menu: 'border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10',
    sectionBorder: 'border-zinc-100',
    heading: 'text-zinc-900',
    secondary: 'text-zinc-500',
    item: 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
    itemIcon: 'text-zinc-400',
    role: 'text-zinc-500',
  },
  dark: {
    button: 'border-transparent text-zinc-100 hover:border-zinc-700/50 hover:bg-zinc-800/70',
    subtleText: 'text-zinc-400',
    chevron: 'text-zinc-500',
    avatar: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
    menu: 'border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/40',
    sectionBorder: 'border-zinc-800',
    heading: 'text-zinc-100',
    secondary: 'text-zinc-400',
    item: 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100',
    itemIcon: 'text-zinc-500',
    role: 'text-zinc-500',
  },
} as const;

function getPlanBadgeClasses(plan: string) {
  switch (plan) {
    case 'Institutional':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'ProTrader':
      return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
    case 'Trader':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'Analyst':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    default:
      return 'text-zinc-400 bg-zinc-700/30 border-zinc-700/50';
  }
}

export default function UserAccountMenu({ variant = 'dark', subtitle }: UserAccountMenuProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = useMemo(() => {
    if (!user?.name) return user?.email?.[0]?.toUpperCase() ?? 'U';

    return user.name
      .split(' ')
      .slice(0, 2)
      .map((namePart) => namePart[0])
      .join('')
      .toUpperCase();
  }, [user]);

  if (!user) {
    return null;
  }

  const buttonSubtitle = subtitle ?? `${user.plan} Plan`;
  const planBadgeClasses = getPlanBadgeClasses(user.plan);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-all ${styles.button}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${styles.avatar}`}>
          <span className="text-xs font-bold font-mono">{userInitials}</span>
        </div>
        <div className="hidden text-left md:block">
          <div className={`max-w-[140px] truncate text-xs font-semibold leading-tight ${styles.heading}`}>
            {user.name || user.email}
          </div>
          <div className={`text-[10px] font-mono ${styles.subtleText}`}>{buttonSubtitle}</div>
        </div>
        <ChevronDown className={`hidden h-3.5 w-3.5 transition-transform md:block ${styles.chevron} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border ${styles.menu}`}>
          <div className={`px-4 py-4 border-b ${styles.sectionBorder}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${styles.avatar}`}>
                <span className="text-sm font-bold font-mono">{userInitials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className={`truncate text-sm font-semibold ${styles.heading}`}>{user.name || 'User'}</div>
                <div className={`truncate text-xs ${styles.secondary}`}>{user.email}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className={`rounded border px-2 py-0.5 text-xs font-mono ${planBadgeClasses}`}>
                {user.plan} Plan
              </span>
              <span className={`text-[10px] font-mono uppercase ${styles.role}`}>{user.role}</span>
            </div>
            <div className={`mt-2 text-[11px] ${styles.secondary}`}>{user.country}</div>
          </div>

          <div className="py-1.5">
            <Link
              href="/command-center"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${styles.item}`}
            >
              <LayoutDashboard className={`h-4 w-4 ${styles.itemIcon}`} />
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${styles.item}`}
            >
              <UserIcon className={`h-4 w-4 ${styles.itemIcon}`} />
              Profile
            </Link>
            <Link
              href="/configuration"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${styles.item}`}
            >
              <Settings className={`h-4 w-4 ${styles.itemIcon}`} />
              Settings
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${styles.item}`}
            >
              <CreditCard className={`h-4 w-4 ${styles.itemIcon}`} />
              Manage Subscription
            </Link>
            {(user.role === 'Super Admin' || user.role === 'Administrator') && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${styles.item}`}
              >
                <Shield className={`h-4 w-4 ${styles.itemIcon}`} />
                Administration
              </Link>
            )}
          </div>

          <div className={`border-t py-1.5 ${styles.sectionBorder}`}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}