'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { courseCurriculum, getAllLessons, type LessonRecord } from '@/lib/learning/curriculum';

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  Intermediate: 'text-amber-700 border-amber-200 bg-amber-50',
};

export default function OurCoursesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const { progressData, progressMap, momentum, isLoading: progressLoading, refresh } = useLearningProgress();
  const allLessons = useMemo(() => getAllLessons(), []);

  async function enroll() {
    setEnrolling(true);
    try {
      const res = await fetch('/api/learning/enroll', { method: 'POST' });
      if (res.ok) await refresh();
    } finally {
      setEnrolling(false);
    }
  }

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


  const chapterCount = courseCurriculum.length;
  const topicCount = courseCurriculum.reduce((sum, chapter) => sum + chapter.days.length, 0);
  const lessonCount = allLessons.length;
  const subtopicCount = lessonCount;

  return (
      <div className="max-w-6xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">Cacsms Academy Academy</p>
              <h1 className="mt-2 text-2xl font-bold text-zinc-900">Professional Forex Trading Course</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                A standard, modern learning environment with clear progression: Chapters, Topics, Subtopics, and Lessons.
                Build confidence daily with structured theory, real chart context, and guided execution discipline.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">108 Lessons</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">6 Chapters</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">36 Topics</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">108 Subtopics</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">AI Learning Assistant</span>
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
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{overallPct}%</p>
                    <div className="mt-1.5 h-2 w-36 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${overallPct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {progressData.completedCount} / {progressData.totalLessons} lessons completed
                    </p>
                    <div className="mt-2 flex items-center justify-end gap-2 text-[11px]">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                        Streak: {momentum.streakDays} day{momentum.streakDays === 1 ? '' : 's'}
                      </span>
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600">
                        Last activity: {momentum.lastActivityLabel}
                      </span>
                    </div>
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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                {progressData?.enrolled ? 'Continue Learning' : "Today's Preview Lessons"}
              </h2>
              {todayLessons[0] && (
                <p className="mt-1 text-base font-semibold text-zinc-900">
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
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">Course Complete!</p>
              <p className="mt-1 text-sm text-zinc-600">You have completed all 108 lessons. Excellent work.</p>
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
                        ? 'border-emerald-300 bg-emerald-50'
                        : isCurrent
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-600">Lesson {lesson.lessonNumber}</span>
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
                    <p className="mt-2 text-sm font-semibold leading-snug text-zinc-900">{lesson.title}</p>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-600">{lesson.summary}</p>
                    <div className="mt-3">
                      {isLocked ? (
                        <Link href="/login" className="text-xs text-emerald-500 hover:text-emerald-400">
                          Sign in to access →
                        </Link>
                      ) : (
                        <Link
                          href={`/our-courses/lesson/${encodeURIComponent(lesson.slug)}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
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

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Learning Architecture</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Chapters</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{chapterCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Each chapter is one guided week/module.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Topics</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{topicCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Daily themes that define context and focus.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Subtopics</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{subtopicCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Concept chunks for structured understanding.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Lessons</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{lessonCount}</p>
              <p className="mt-1 text-xs text-zinc-600">Practical lesson environments with AI support.</p>
            </div>
          </div>
        </section>

        {/* Chapter Cards */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Course Chapters</h2>
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
                    isActive ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Chapter {week.week}</p>
                      <h3 className="mt-1.5 text-sm font-semibold text-zinc-900">{week.module}</h3>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLORS[week.level] ?? 'text-zinc-400 border-zinc-700'}`}
                    >
                      {week.level}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600">{week.description}</p>

                  <ul className="mt-3 space-y-1.5">
                    {week.days.map((daySet) => {
                      const dayLessons = allLessons.filter((l) => l.week === week.week && l.day === daySet.day);
                      const dayCompleted = dayLessons.filter((l) => progressMap.get(l.slug) === 'completed').length;
                      const dayDone = dayCompleted === dayLessons.length;

                      return (
                        <li key={daySet.day} className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {dayDone ? (
                              <span className="shrink-0 text-[11px] text-emerald-400">✓</span>
                            ) : (
                              <span className="shrink-0 h-1 w-1 rounded-full bg-zinc-600" />
                            )}
                            <span className="truncate text-xs text-zinc-700">{daySet.dayTheme}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-zinc-500">
                              {dayCompleted}/{dayLessons.length} lessons
                            </span>
                            {!isLocked && (
                              <Link
                                href={`/our-courses/day/${week.week}/${daySet.day.toLowerCase()}`}
                                className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-400"
                              >
                                Read More
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {progressData?.enrolled && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[10px] text-zinc-600">
                        <span>{completed}/{total} lessons</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
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
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Create a free account to track your progress</p>
            <p className="mt-1 text-sm text-zinc-600">
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
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
  );
}
