function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeLessonSlug(value: string): string {
  if (!value) return '';

  const decoded = safeDecode(value)
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')
    .trim()
    .toLowerCase();

  return decoded;
}

export function deriveActiveLessonSlug(pathname: string, routeSlug: string): string {
  const marker = '/our-courses/lesson/';
  const decodedPath = safeDecode(pathname).replace(/[?#].*$/, '').toLowerCase();
  const normalizedRouteSlug = normalizeLessonSlug(routeSlug);

  const markerIdx = decodedPath.indexOf(marker);
  if (markerIdx >= 0) {
    const tail = decodedPath.slice(markerIdx + marker.length);
    const firstSegment = tail.split('/')[0] ?? '';
    const normalizedTailSlug = normalizeLessonSlug(firstSegment);
    if (normalizedTailSlug) return normalizedTailSlug;
  }

  return normalizedRouteSlug;
}

export function isActiveLessonSidebarItem(itemSlug: string, activeSlug: string): boolean {
  return normalizeLessonSlug(itemSlug) === normalizeLessonSlug(activeSlug);
}
