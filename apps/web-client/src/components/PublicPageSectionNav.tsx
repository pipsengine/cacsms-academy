'use client';

import { useEffect, useMemo, useState } from 'react';

type NavItem = {
  id: string;
  label: string;
  shortLabel?: string;
};

export default function PublicPageSectionNav({ items }: { items: NavItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? 'overview');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && itemIds.includes(hash)) {
      setActiveId(hash);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-120px 0px -60% 0px',
        threshold: [0.1, 0.3, 0.6],
      }
    );

    itemIds.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [itemIds]);

  useEffect(() => {
    if (!activeId) return;

    const currentHash = window.location.hash.replace('#', '');
    const nextUrl =
      activeId === 'overview'
        ? `${window.location.pathname}${window.location.search}`
        : `${window.location.pathname}${window.location.search}#${activeId}`;

    if (activeId === 'overview' && !currentHash) return;
    if (currentHash === activeId) return;

    window.history.replaceState(null, '', nextUrl);
  }, [activeId]);

  useEffect(() => {
    let ticking = false;

    const computeProgress = () => {
      const firstSection = document.getElementById(itemIds[0] ?? 'overview');
      const lastSection = document.getElementById(itemIds[itemIds.length - 1] ?? 'next-steps');

      if (!firstSection || !lastSection) {
        setProgressPercent(0);
        ticking = false;
        return;
      }

      const startY = firstSection.offsetTop;
      const endY = lastSection.offsetTop + lastSection.offsetHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      const total = Math.max(1, endY - startY);
      const completed = Math.min(total, Math.max(0, viewportBottom - startY));
      setProgressPercent((completed / total) * 100);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(computeProgress);
    };

    computeProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [itemIds]);

  return (
    <section className="sticky top-16 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
          {items.map((item) => {
            const isActive = activeId === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200 scale-[1.02]'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                }`}
              >
                <span className="sm:hidden">{item.shortLabel ?? item.label}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200/70">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="min-w-[3ch] text-[11px] font-semibold text-zinc-500">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>
    </section>
  );
}
