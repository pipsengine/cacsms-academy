import { describe, expect, it } from 'vitest';
import { getAllLessons } from '../curriculum.ts';
import { parseActiveLearningContext } from '../navigatorContext.ts';

const LESSONS = getAllLessons();

describe('parseActiveLearningContext', () => {
  it('extracts active lesson from lesson route', () => {
    const ctx = parseActiveLearningContext(
      '/our-courses/lesson/w1-dwed-l3-why-forex-volume-and-range-patterns-vary-by-time-of-day',
      LESSONS
    );

    expect(ctx.activeSlug).toBe('w1-dwed-l3-why-forex-volume-and-range-patterns-vary-by-time-of-day');
    expect(ctx.activeWeek).toBe(1);
    expect(ctx.activeDay).toBe('wednesday');
  });

  it('extracts active topic context from day route', () => {
    const ctx = parseActiveLearningContext('/our-courses/day/1/wednesday', LESSONS);

    expect(ctx.activeSlug).toBe('');
    expect(ctx.activeWeek).toBe(1);
    expect(ctx.activeDay).toBe('wednesday');
  });

  it('returns empty context for unknown lesson slug', () => {
    const ctx = parseActiveLearningContext('/our-courses/lesson/unknown-lesson', LESSONS);

    expect(ctx.activeSlug).toBe('');
    expect(Number.isNaN(ctx.activeWeek)).toBe(true);
    expect(ctx.activeDay).toBe('');
  });
});
