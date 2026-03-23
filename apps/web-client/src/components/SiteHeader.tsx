'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Menu } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import UserAccountMenu from '@/components/UserAccountMenu';

const navItems = [
  { href: '/#platform', label: 'Platform' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#daily-trading-tips', label: 'Daily Trading Tips' },
  { href: '/#our-courses', label: 'Our Courses' },
  { href: '/#weekly-analysis', label: 'Weekly Analysis' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, logout, isLoading } = useAuth();
  const isAuthenticated = !isLoading && Boolean(user);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600">
            <Cpu className="h-8 w-8" />
            <div className="leading-tight">
              <span className="block font-mono text-xl font-bold tracking-wider text-zinc-900">CACSMS ACADEMY</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 md:block">Think Like Institutions. Trade With Precision</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <UserAccountMenu variant="light" subtitle="Your Account" />
            ) : !isLoading ? (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900">Login</Link>
                <Link href="/register" className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800">Sign Up</Link>
              </>
            ) : (
              <div className="h-10 w-36" />
            )}
          </div>

          <button
            type="button"
            className="p-2 text-zinc-600 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 border-t border-zinc-200 pt-4">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Your Account</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-900">{user.name || user.email}</p>
                    <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">{user.plan} Plan</span>
                      <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-semibold text-zinc-600">{user.role}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/command-center" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900">Dashboard</Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900">Profile</Link>
                    <Link href="/configuration" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900">Settings</Link>
                    <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900">Manage Subscription</Link>
                    {(user.role === 'Super Admin' || user.role === 'Administrator') && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900">Administration</Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        void logout();
                      }}
                      className="text-left text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : !isLoading ? (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900">Login</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800">Sign Up</Link>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}