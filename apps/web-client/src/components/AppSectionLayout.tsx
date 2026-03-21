import React from 'react';

type SectionNavItem = {
  id: string;
  label: string;
  helper?: string;
};

type AppSectionLayoutProps = {
  title: string;
  description: string;
  navItems: SectionNavItem[];
  children: React.ReactNode;
};

export default function AppSectionLayout({ title, description, navItems, children }: AppSectionLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 self-start rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Section Navigation</p>
          <nav className="mt-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-lg border border-zinc-200 bg-slate-50 px-3 py-2 hover:border-zinc-300"
              >
                <p className="text-sm font-semibold text-zinc-700">{item.label}</p>
                {item.helper && <p className="mt-1 text-xs text-zinc-500">{item.helper}</p>}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
