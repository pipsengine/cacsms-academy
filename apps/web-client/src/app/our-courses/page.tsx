'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { courseCurriculum, getAllLessons, type LessonRecord } from '@/lib/learning/curriculum';

type ProgressEntry = { lessonSlug: string; status: string };
type ProgressData = {
  enrolled: boolean;
  currentLessonIndex: number;
  currentLesson: LessonRecord | null;
  completedCount: number;
  totalLessons: number;
  enrolledAt?: string;
  progress: ProgressEntry[];
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  Intermediate: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
};

export default function OurCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const allLessons = useMemo(() => getAllLessons(), []);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    setProgressLoading(true);
    try {
      const res = await fetch('/api/learning/progress');
      if (res.ok) setProgressData(await res.json() as ProgressData);
    } finally {
      setProgressLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadProgress(); }, [loadProgress]);

  async function enroll() {
    setEnrolling(true);
    try {
      const res = await fetch('/api/learning/enroll', { method: 'POST' });
      if (res.ok) await loadProgress();
    } finally {
      setEnrolling(false);
    }
  }

  const progressMap = useMemo(() => {
    const map = new Map<string, string>();
    progressData?.progress.forEach((p) => map.set(p.lessonSlug, p.status));
    return map;
  }, [progressData]);

  function getWeekProgress(weekNum: number) {
    const weekLessons = allLessons.filter((l) => l.week === weekNum);
    const completed = weekLessons.filter((l) => progressMap.get(l.slug) === 'completed').length;
    return { completed, total: weekLessons.length };
  }

  const todayLessons = useMemo((): LessonRecord[] => {
    if (!progressData?.enrolled) {
      return allLessons.filter((l) => l.week === 1 && l.day === 'Monday');
    }
    const currentIndex = progressData.currentLessonIndex ?? 0;
    if (currentIndex >= allLessons.length) return [];
    const current = allLessons[currentIndex];
    if (!current) return [];
    return allLessons.filter((l) => l.week === current.week && l.day === current.day);
  }, [allLessons, progressData]);

  const overallPct = progressData?.enrolled
    ? Math.round(((progressData.completedCount ?? 0) / (progressData.totalLessons ?? 108)) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-8">
        {/* Header */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">IntelTrader Academy</p>
              <h1 className="mt-2 text-2xl font-bold text-zinc-100">Professional Forex Trading Course</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                6-week structured program. 3 focused lessons per day. Progress from forex foundations through
                institutional liquidity concepts at your own pace — with AI assistance on every lesson.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">108 Lessons</span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">6 Modules</span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">3 Topics / Day</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">AI Learning Assistant</span>
              </div>
            </div>

            {!authLoading && (
              <div className="shrink-0">
                {!user ? (
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Sign in to Start
                  </Link>
                ) : progressData?.enrolled ? (
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Overall Progress</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">{overallPct}%</p>
                    <div className="mt-1.5 h-2 w-36 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${overallPct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {progressData.completedCount} / {progressData.totalLessons} lessons
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => void enroll()}
                    disabled={enrolling || progressLoading}
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {enrolling ? 'Starting…' : 'Start Course from Beginning'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Today's Lessons / Continue Learning */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                {progressData?.enrolled ? 'Continue Learning' : "Today's Preview Lessons"}
              </h2>
              {todayLessons[0] && (
                <p className="mt-1 text-base font-semibold text-zinc-100">
                  Week {todayLessons[0].week} · {todayLessons[0].day} · {todayLessons[0].dayTheme}
                </p>
              )}
            </div>
            {progressData?.enrolled && progressData.currentLesson && (
              <Link
                href={`/our-courses/lesson/${encodeURIComponent(progressData.currentLesson.slug)}`}
                className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Continue →
              </Link>
            )}
          </div>

          {todayLessons.length === 0 && progressData?.enrolled ? (
            <div className="mt-4 rounded-lg border border-emerald-700/30 bg-emerald-900/20 p-4">
              <p className="text-sm font-semibold text-emerald-300">🎓 Course Complete!</p>
              <p className="mt-1 text-sm text-zinc-400">You have completed all 108 lessons. Excellent work.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {todayLessons.map((lesson) => {
                const status = progressMap.get(lesson.slug);
                const isCompleted = status === 'completed';
                const isStarted = status === 'started';
                const isCurrent = lesson.lessonIndex === (progressData?.currentLessonIndex ?? 0);
                const isLocked = !progressData?.enrolled;

                return (
                  <div
                    key={lesson.slug}
                    className={`rounded-lg border p-4 transition-all ${
                      isCompleted
                        ? 'border-emerald-700/40 bg-emerald-900/10'
                        : isCurrent
                        ? 'border-emerald-500/50 bg-emerald-900/20'
                        : 'border-zinc-800 bg-zinc-950/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-500">Lesson {lesson.lessonNumber}</span>
                      {isCompleted && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          ✓ Done
                        </span>
                      )}
                      {isStarted && !isCompleted && (
                        <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                          In Progress
                        </span>
                      )}
                      {isCurrent && !isCompleted && !isStarted && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Up Next
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-snug text-zinc-100">{lesson.title}</p>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">{lesson.summary}</p>
                    <div className="mt-3">
                      {isLocked ? (
                        <Link href="/login" className="text-xs text-emerald-500 hover:text-emerald-400">
                          Sign in to access →
                        </Link>
                      ) : (
                        <Link
                          href={`/our-courses/lesson/${encodeURIComponent(lesson.slug)}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          {isCompleted ? 'Review' : isStarted ? 'Continue' : 'Read More'} →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Module Cards */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Course Modules</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courseCurriculum.map((week) => {
              const { completed, total } = getWeekProgress(week.week);
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isLocked = !progressData?.enrolled;
              const isActive = progressData?.currentLesson?.week === week.week;

              return (
                <div
                  key={week.week}
                  className={`rounded-xl border p-5 ${
                    isActive ? 'border-emerald-500/40 bg-emerald-900/10' : 'border-zinc-800 bg-zinc-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Week {week.week}</p>
                      <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">{week.module}</h3>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLORS[week.level] ?? 'text-zinc-400 border-zinc-700'}`}
                    >
                      {week.level}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{week.description}</p>

                  <ul className="mt-3 space-y-1.5">
                    {week.days.map((daySet) => {
                      const dayLessons = allLessons.filter((l) => l.week === week.week && l.day === daySet.day);
                      const dayCompleted = dayLessons.filter((l) => progressMap.get(l.slug) === 'completed').length;
                      const dayDone = dayCompleted === dayLessons.length;
                      const firstLesson = dayLessons[0];

                      return (
                        <li key={daySet.day} className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {dayDone ? (
                              <span className="shrink-0 text-[11px] text-emerald-400">✓</span>
                            ) : (
                              <span className="shrink-0 h-1 w-1 rounded-full bg-zinc-600" />
                            )}
                            <span className="truncate text-xs text-zinc-300">{daySet.dayTheme}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-zinc-600">
                              {dayCompleted}/{dayLessons.length}
                            </span>
                            {!isLocked && firstLesson && (
                              <Link
                                href={`/our-courses/lesson/${encodeURIComponent(firstLesson.slug)}`}
                                className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-400"
                              >
                                Open
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {progressData?.enrolled && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>{completed}/{total} lessons</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Auth gate prompt */}
        {!authLoading && !user && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-6 text-center">
            <p className="text-sm font-semibold text-zinc-200">Create a free account to track your progress</p>
            <p className="mt-1 text-sm text-zinc-400">
              Progress tracking, AI learning assistant, and lesson completion status require a free account.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
