'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { courseCurriculum, getAllLessons, type CurriculumDay, type LessonRecord } from '@/lib/learning/curriculum';

type ProgressEntry = { lessonSlug: string; status: string };
type ProgressData = {
  enrolled: boolean;
  currentLessonIndex: number;
  currentLesson: LessonRecord | null;
  completedCount: number;
  totalLessons: number;
  progress: ProgressEntry[];
};

const ALL_LESSONS = getAllLessons();

function parseActiveContext(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const activeSlug = parts[2] === 'lesson' ? decodeURIComponent(parts[3] ?? '') : '';
  const activeWeek = parts[2] === 'day' ? Number(parts[3]) : NaN;
  const activeDay = parts[2] === 'day' ? (parts[4] ?? '').toLowerCase() : '';

  if (activeSlug) {
    const lesson = ALL_LESSONS.find((entry) => entry.slug === activeSlug);
    if (!lesson) return { activeSlug: '', activeWeek: NaN, activeDay: '' };
    return {
      activeSlug,
      activeWeek: lesson.week,
      activeDay: lesson.day.toLowerCase(),
    };
  }

  if (Number.isFinite(activeWeek)) {
    return { activeSlug: '', activeWeek, activeDay };
  }

  return { activeSlug: '', activeWeek: NaN, activeDay: '' };
}

export default function LearningNavigator() {
  const pathname = usePathname() ?? '';
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (!user) {
      setProgressData(null);
      return;
    }

    let mounted = true;
    fetch('/api/learning/progress')
      .then(async (res) => {
        if (!res.ok || !mounted) return;
        const payload = (await res.json()) as ProgressData;
        setProgressData(payload);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [user]);

  const progressMap = useMemo(() => {
    const map = new Map<string, string>();
    progressData?.progress.forEach((entry) => map.set(entry.lessonSlug, entry.status));
    return map;
  }, [progressData]);

  const { activeSlug, activeWeek, activeDay } = useMemo(() => parseActiveContext(pathname), [pathname]);

  const overallPct = progressData?.enrolled
    ? Math.round((progressData.completedCount / Math.max(progressData.totalLessons, 1)) * 100)
    : 0;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Learning Navigator</p>
        <p className="mt-2 text-sm text-zinc-700">Move through chapters, topics, subtopics, and lessons with one persistent map.</p>

        <div className="mt-4 space-y-2">
          {progressData?.enrolled && progressData.currentLesson ? (
            <Link
              href={`/our-courses/lesson/${encodeURIComponent(progressData.currentLesson.slug)}`}
              className="block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Resume: {progressData.currentLesson.title}
            </Link>
          ) : (
            <Link
              href="/our-courses"
              className="block rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              Course Home
            </Link>
          )}

          {progressData?.enrolled && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Overall Progress</span>
                <span className="font-semibold text-zinc-800">{overallPct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${overallPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Curriculum Tree</p>
        <div className="mt-3 space-y-2">
          {courseCurriculum.map((chapter) => {
            const chapterLessons = ALL_LESSONS.filter((lesson) => lesson.week === chapter.week);
            const chapterDone = chapterLessons.filter((lesson) => progressMap.get(lesson.slug) === 'completed').length;
            const chapterOpen = chapter.week === activeWeek || chapter.week === progressData?.currentLesson?.week;

            return (
              <details key={chapter.week} open={chapterOpen} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Chapter {chapter.week}</p>
                      <p className="text-sm font-semibold text-zinc-900">{chapter.module}</p>
                    </div>
                    <span className="text-[11px] text-zinc-600">{chapterDone}/{chapterLessons.length}</span>
                  </div>
                </summary>

                <div className="mt-2 space-y-2 border-t border-zinc-200 pt-2">
                  {chapter.days.map((daySet) => {
                    const dayKey = daySet.day.toLowerCase();
                    const dayLessons = ALL_LESSONS.filter((lesson) => lesson.week === chapter.week && lesson.day === daySet.day);
                    const completed = dayLessons.filter((lesson) => progressMap.get(lesson.slug) === 'completed').length;
                    const activeTopic = chapter.week === activeWeek && dayKey === activeDay;

                    return (
                      <div key={daySet.day} className="rounded-md border border-zinc-200 bg-white px-2 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/our-courses/day/${chapter.week}/${dayKey}`}
                            className={`text-xs font-semibold ${activeTopic ? 'text-emerald-700' : 'text-zinc-700 hover:text-zinc-900'}`}
                          >
                            {daySet.day} Topic
                          </Link>
                          <span className="text-[10px] text-zinc-500">{completed}/{dayLessons.length}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{daySet.dayTheme}</p>

                        <div className="mt-2 space-y-1">
                          {dayLessons.map((lesson) => {
                            const status = progressMap.get(lesson.slug);
                            const isActiveLesson = lesson.slug === activeSlug;

                            return (
                              <Link
                                key={lesson.slug}
                                href={`/our-courses/lesson/${encodeURIComponent(lesson.slug)}`}
                                className={`block rounded px-2 py-1 text-[11px] ${
                                  isActiveLesson
                                    ? 'bg-emerald-100 font-semibold text-emerald-800'
                                    : status === 'completed'
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800'
                                }`}
                              >
                                L{lesson.lessonNumber}: {lesson.title}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
