import type { LessonRecord } from '@/lib/learning/curriculum';

type ActiveLearningContext = {
  activeSlug: string;
  activeWeek: number;
  activeDay: string;
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseActiveLearningContext(pathname: string, lessons: LessonRecord[]): ActiveLearningContext {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[1] ?? '';

  const rawSlug = section === 'lesson' ? parts[2] ?? '' : '';
  const activeSlug = rawSlug ? safeDecode(rawSlug) : '';

  const activeWeek = section === 'day' ? Number(parts[2]) : NaN;
  const activeDay = section === 'day' ? safeDecode(parts[3] ?? '').toLowerCase() : '';

  if (activeSlug) {
    const lesson = lessons.find((entry) => entry.slug === activeSlug);
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
