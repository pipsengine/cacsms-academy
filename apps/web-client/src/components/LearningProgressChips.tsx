'use client';

import { useMemo } from 'react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { getAllLessons, type CurriculumDay } from '@/lib/learning/curriculum';

type LearningProgressChipsProps = {
  week: number;
  day?: CurriculumDay;
  currentLessonSlug?: string;
};

const ALL_LESSONS = getAllLessons();

export default function LearningProgressChips({ week, day, currentLessonSlug }: LearningProgressChipsProps) {
  const { progressData, progressMap } = useLearningProgress();

  const chapterLessons = useMemo(() => ALL_LESSONS.filter((lesson) => lesson.week === week), [week]);
  const topicLessons = useMemo(
    () => (day ? chapterLessons.filter((lesson) => lesson.day === day) : []),
    [chapterLessons, day]
  );

  const chapterCompleted = chapterLessons.filter((lesson) => progressMap.get(lesson.slug) === 'completed').length;
  const topicCompleted = topicLessons.filter((lesson) => progressMap.get(lesson.slug) === 'completed').length;
  const lessonStatus = currentLessonSlug ? progressMap.get(currentLessonSlug) : undefined;

  if (!progressData?.enrolled) {
    return (
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-600">Sign in to track progress</span>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
        Chapter Progress: {chapterCompleted}/{chapterLessons.length}
      </span>
      {day && (
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-zinc-700">
          Topic Progress: {topicCompleted}/{topicLessons.length}
        </span>
      )}
      {lessonStatus === 'completed' && (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
          Lesson Status: Completed
        </span>
      )}
      {lessonStatus === 'started' && (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-semibold text-amber-700">
          Lesson Status: In Progress
        </span>
      )}
    </div>
  );
}
