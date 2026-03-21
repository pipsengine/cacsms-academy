import { describe, expect, it } from 'vitest';
import {
  deriveActiveLessonSlug,
  isActiveLessonSidebarItem,
  normalizeLessonSlug,
} from '../lessonSidebarActive';

describe('lessonSidebarActive', () => {
  it('normalizes slugs safely', () => {
    expect(normalizeLessonSlug('/W1-DWED-L3-FOO/')).toBe('w1-dwed-l3-foo');
    expect(normalizeLessonSlug('w1-dwed-l3-foo?x=1#top')).toBe('w1-dwed-l3-foo');
    expect(normalizeLessonSlug('w1-dwed-l3-why-forex%20volume')).toBe('w1-dwed-l3-why-forex volume');
  });

  it('derives active slug from pathname when route slug is stale', () => {
    const path = '/our-courses/lesson/w1-dwed-l3-why-forex-volume-and-range-patterns-vary-by-time-of-day/';
    const routeSlug = 'w1-dwed-l2-session-overlaps-and-peak-volatility-windows';

    expect(deriveActiveLessonSlug(path, routeSlug)).toBe(
      'w1-dwed-l3-why-forex-volume-and-range-patterns-vary-by-time-of-day'
    );
  });

  it('falls back to route slug when pathname does not match lesson route', () => {
    expect(deriveActiveLessonSlug('/dashboard', 'w1-dwed-l1-the-four-major-trading-sessions-asia-london-new-york-pacific')).toBe(
      'w1-dwed-l1-the-four-major-trading-sessions-asia-london-new-york-pacific'
    );
  });

  it('matches active sidebar item ignoring case and slash differences', () => {
    expect(
      isActiveLessonSidebarItem(
        'W1-DWED-L3-WHY-FOREX-VOLUME-AND-RANGE-PATTERNS-VARY-BY-TIME-OF-DAY',
        '/w1-dwed-l3-why-forex-volume-and-range-patterns-vary-by-time-of-day/'
      )
    ).toBe(true);
  });
});
