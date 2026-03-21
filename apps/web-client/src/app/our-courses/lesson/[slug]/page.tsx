'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/components/AuthProvider';
import LearningProgressChips from '@/components/LearningProgressChips';
import { trackLearningEvent } from '@/lib/learning/analytics';
import { getAdjacentLessons, getLessonBySlug, getModuleLessons } from '@/lib/learning/curriculum';
import { deriveActiveLessonSlug, isActiveLessonSidebarItem } from '@/lib/learning/lessonSidebarActive';
import { getChapterQuiz } from '@/lib/learning/chapterQuizRegistry';

type CourseUnit = {
  title: string;
  summary: string;
  content: string;
  sections: string[];
  example: string;
  is_assignment: boolean;
  assignment: string;
  difficulty_level: 'Beginner' | 'Intermediate';
  image_prompt: string;
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type LessonHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

function CandlestickVisualDiagram() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Candle Anatomy Diagram
      </div>
      <div className="p-4">
        <svg viewBox="0 0 720 220" role="img" aria-label="Candlestick anatomy diagram" className="h-auto w-full">
          <rect x="0" y="0" width="720" height="220" fill="#ffffff" />

          <line x1="70" y1="25" x2="70" y2="195" stroke="#9ca3af" strokeWidth="2" />
          <rect x="48" y="78" width="44" height="70" fill="#22c55e" stroke="#15803d" strokeWidth="2" rx="4" />
          <line x1="48" y1="78" x2="48" y2="78" stroke="#15803d" />

          <line x1="220" y1="35" x2="220" y2="198" stroke="#9ca3af" strokeWidth="2" />
          <rect x="198" y="62" width="44" height="92" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" rx="4" />

          <line x1="370" y1="45" x2="370" y2="190" stroke="#9ca3af" strokeWidth="2" />
          <rect x="348" y="92" width="44" height="48" fill="#22c55e" stroke="#15803d" strokeWidth="2" rx="4" />

          <line x1="520" y1="30" x2="520" y2="185" stroke="#9ca3af" strokeWidth="2" />
          <rect x="498" y="82" width="44" height="54" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" rx="4" />

          <text x="42" y="210" fill="#334155" fontSize="12">Bullish</text>
          <text x="197" y="210" fill="#334155" fontSize="12">Bearish</text>
          <text x="322" y="210" fill="#334155" fontSize="12">Long Lower Wick</text>
          <text x="470" y="210" fill="#334155" fontSize="12">Long Upper Wick</text>

          <line x1="90" y1="78" x2="150" y2="60" stroke="#0f766e" strokeWidth="2" />
          <text x="154" y="58" fill="#0f766e" fontSize="12">Body</text>

          <line x1="70" y1="25" x2="150" y2="24" stroke="#0f766e" strokeWidth="2" />
          <text x="154" y="28" fill="#0f766e" fontSize="12">Upper Wick (rejection)</text>

          <line x1="70" y1="195" x2="150" y2="182" stroke="#0f766e" strokeWidth="2" />
          <text x="154" y="186" fill="#0f766e" fontSize="12">Lower Wick (rejection)</text>

          <line x1="242" y1="154" x2="340" y2="166" stroke="#0f766e" strokeWidth="2" />
          <text x="344" y="170" fill="#0f766e" fontSize="12">Close Location</text>
        </svg>
      </div>
    </div>
  );
}

function headingSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function childrenToText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (!children) return '';
  if (Array.isArray(children)) {
    return children.map((child) => childrenToText(child)).join('');
  }
  if (typeof children === 'object' && 'props' in children) {
    return childrenToText((children as { props?: { children?: ReactNode } }).props?.children ?? '');
  }
  return '';
}

export default function LessonPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const slugParam = params?.slug;
  const rawSlug = (Array.isArray(slugParam) ? slugParam[0] : slugParam) ?? '';
  const slug: string = rawSlug ? decodeURIComponent(rawSlug) : '';
  const activeSidebarSlug = useMemo(() => deriveActiveLessonSlug(pathname, slug as string), [pathname, slug]);

  const lesson = useMemo(() => getLessonBySlug(slug), [slug]);
  const adjacent = useMemo(() => (lesson ? getAdjacentLessons(lesson.slug) : { previous: null, next: null }), [lesson]);
  const moduleTopics = useMemo(() => (lesson ? getModuleLessons(lesson.week) : []), [lesson]);

  // Show the chapter quiz prompt when on the last lesson of a chapter (Saturday L3)
  const isLastLessonOfChapter = lesson?.day === 'Saturday' && lesson.lessonNumber === 3;
  const chapterQuiz = useMemo(
    () => (lesson && isLastLessonOfChapter ? getChapterQuiz(lesson.week) : null),
    [lesson, isLastLessonOfChapter]
  );

  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError] = useState<string | null>(null);
  const [lessonStatus, setLessonStatus] = useState<string>('not_started');
  const [markingComplete, setMarkingComplete] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const lessonContentRef = useRef<HTMLDivElement>(null);
  const topicListContainerRef = useRef<HTMLUListElement>(null);
  const activeTopicLinkRef = useRef<HTMLAnchorElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const lessonHeadings = useMemo<LessonHeading[]>(() => {
    if (!unit?.content) return [];

    const lines = unit.content.split('\n');
    const slugCount = new Map<string, number>();
    const headings: LessonHeading[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const match = /^(##|###)\s+(.+)$/.exec(trimmed);
      if (!match) continue;

      const level = match[1] === '###' ? 3 : 2;
      const rawTitle = match[2].trim();
      const baseSlug = headingSlug(rawTitle);
      if (!baseSlug) continue;

      const count = slugCount.get(baseSlug) ?? 0;
      slugCount.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

      headings.push({ id, title: rawTitle, level });
    }

    return headings;
  }, [unit?.content]);

  const isCandlestickLesson = useMemo(() => {
    const haystack = [lesson?.title, unit?.title, unit?.summary, unit?.content].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes('candlestick') || haystack.includes('candle');
  }, [lesson?.title, unit?.content, unit?.summary, unit?.title]);

  const shouldShowVisualExplainer = isCandlestickLesson;

  useEffect(() => {
    if (!lesson) return;
    setUnitLoading(true);
    setUnitError(null);

    const qs = new URLSearchParams({
      topic_title: lesson.title,
      week_number: String(lesson.week),
      day_of_week: lesson.day,
      topic_type: lesson.type,
    });

    fetch(`/api/learning/unit?${qs.toString()}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setUnit((await res.json()) as CourseUnit);
      })
      .catch(() => setUnitError('Unable to load lesson content. Please try again.'))
      .finally(() => setUnitLoading(false));
  }, [lesson]);

  useEffect(() => {
    if (!user || !lesson) return;

    void trackLearningEvent({
      eventType: 'lesson_opened',
      route: `/our-courses/lesson/${encodeURIComponent(lesson.slug)}`,
      lessonSlug: lesson.slug,
      week: lesson.week,
      day: lesson.day,
    });

    fetch('/api/learning/progress')
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { progress?: Array<{ lessonSlug: string; status: string }> };
        const entry = data.progress?.find((p) => p.lessonSlug === lesson.slug);
        if (entry) setLessonStatus(entry.status);
      })
      .catch(() => undefined);

    fetch('/api/learning/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonSlug: lesson.slug, status: 'started' }),
    }).catch(() => undefined);
  }, [user, lesson]);

  const markComplete = useCallback(async () => {
    if (!user || !lesson) return;
    setMarkingComplete(true);
    try {
      const res = await fetch('/api/learning/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug: lesson.slug, status: 'completed' }),
      });
      if (!res.ok) return;
      void trackLearningEvent({
        eventType: 'lesson_completed',
        route: `/our-courses/lesson/${encodeURIComponent(lesson.slug)}`,
        lessonSlug: lesson.slug,
        week: lesson.week,
        day: lesson.day,
      });
      setLessonStatus('completed');
      if (adjacent.next) {
        setTimeout(() => {
          router.push(`/our-courses/lesson/${encodeURIComponent(adjacent.next!.slug)}`);
        }, 1000);
      }
    } finally {
      setMarkingComplete(false);
    }
  }, [adjacent.next, lesson, router, user]);

  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading || !lesson) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/learning/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonSlug: lesson.slug,
          message: userMsg,
          history: chatMessages.slice(-6),
        }),
      });
      const data = (await res.json()) as { reply?: string };
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? 'Unable to respond right now.' }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'AI assistant is temporarily unavailable.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, lesson]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!lessonHeadings.length) {
      setActiveHeadingId('');
      return;
    }

    setActiveHeadingId((current) => current || lessonHeadings[0].id);

    const container = lessonContentRef.current;
    if (!container) return;

    const headingEls = container.querySelectorAll<HTMLElement>('[data-lesson-heading="true"]');
    if (!headingEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const nextId = visible[0].target.getAttribute('id') ?? '';
        if (nextId) setActiveHeadingId(nextId);
      },
      {
        root: null,
        rootMargin: '-18% 0px -62% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lessonHeadings]);

  useEffect(() => {
    const link = activeTopicLinkRef.current;
    const container = topicListContainerRef.current;
    if (!link || !container) return;
    link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [lesson?.slug]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      const isTypingContext = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
      if (isTypingContext) return;

      if (event.key === 'ArrowLeft' && adjacent.previous) {
        void trackLearningEvent({
          eventType: 'keyboard_navigation_used',
          route: `/our-courses/lesson/${encodeURIComponent(lesson?.slug ?? '')}`,
          lessonSlug: lesson?.slug,
          week: lesson?.week,
          day: lesson?.day,
          metadata: { direction: 'previous' },
        });
        router.push(`/our-courses/lesson/${encodeURIComponent(adjacent.previous.slug)}`);
      }

      if (event.key === 'ArrowRight' && adjacent.next) {
        void trackLearningEvent({
          eventType: 'keyboard_navigation_used',
          route: `/our-courses/lesson/${encodeURIComponent(lesson?.slug ?? '')}`,
          lessonSlug: lesson?.slug,
          week: lesson?.week,
          day: lesson?.day,
          metadata: { direction: 'next' },
        });
        router.push(`/our-courses/lesson/${encodeURIComponent(adjacent.next.slug)}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [adjacent.next, adjacent.previous, router]);

  if (!lesson) {
    return (
      <div className="max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">Lesson not found</p>
        <p className="mt-1 text-sm text-red-600">The lesson you are looking for does not exist.</p>
        <Link href="/our-courses" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/our-courses" className="hover:text-zinc-700">Learning Home</Link>
        <span>/</span>
        <span className="text-zinc-600">Chapter {lesson.week} · {lesson.module}</span>
        <span>/</span>
        <span className="text-zinc-800">{lesson.title}</span>
      </nav>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                lesson.level === 'Beginner' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                {lesson.level}
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                {lesson.type === 'assignment' ? 'Assignment Lesson' : 'Lesson'}
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                Chapter {lesson.week} · Topic {lesson.day}
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                Subtopic Lesson {lesson.lessonNumber} of 3
              </span>
              {lessonStatus === 'completed' && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">✓ Completed</span>
              )}
            </div>
            <h1 className="mt-3 text-xl font-bold text-zinc-900">{lesson.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">{lesson.summary}</p>
            <p className="mt-2 text-xs text-zinc-500">Topic Theme: {lesson.dayTheme}</p>
            <LearningProgressChips week={lesson.week} day={lesson.day} currentLessonSlug={lesson.slug} />
          </div>

          {unitLoading && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-zinc-600">Loading lesson content...</p>
            </div>
          )}

          {!unitLoading && unitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">{unitError}</p>
            </div>
          )}

          {!unitLoading && unit && (
            <>
              {shouldShowVisualExplainer && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Visual Explainer</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">{unit.image_prompt}</p>
                  <div className="mt-4">
                    <CandlestickVisualDiagram />
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Lesson</h2>
                <div ref={lessonContentRef} className="prose prose-zinc mt-4 max-w-none scroll-mt-24 prose-headings:font-bold prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-li:text-zinc-700 prose-code:text-emerald-700 prose-pre:bg-zinc-100">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => {
                        const title = childrenToText(children);
                        const id = headingSlug(title);
                        return <h2 id={id} data-lesson-heading="true">{children}</h2>;
                      },
                      h3: ({ children }) => {
                        const title = childrenToText(children);
                        const id = headingSlug(title);
                        return <h3 id={id} data-lesson-heading="true">{children}</h3>;
                      },
                    }}
                  >
                    {unit.content}
                  </ReactMarkdown>
                </div>
              </div>

              {unit.example && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Practical Example</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-700">{unit.example}</p>
                </div>
              )}

              {unit.is_assignment && unit.assignment && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Assignment Instructions</h2>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-900">{unit.assignment}</pre>
                </div>
              )}
            </>
          )}

          {!authLoading && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              {!user ? (
                <p className="text-sm text-zinc-600">
                  <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Sign in</Link>
                  {' '}to track your progress and mark lessons complete.
                </p>
              ) : lessonStatus === 'completed' ? (
                <>
                  <span className="text-sm font-semibold text-emerald-700">✓ Lesson Completed</span>
                  {adjacent.next && (
                    <Link href={`/our-courses/lesson/${encodeURIComponent(adjacent.next.slug)}`} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                      Next Lesson →
                    </Link>
                  )}
                </>
              ) : (
                <button type="button" onClick={() => void markComplete()} disabled={markingComplete || unitLoading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
                  {markingComplete ? 'Saving...' : 'Mark as Complete'}
                </button>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Navigation</p>
            <p className="mt-2 text-[11px] text-zinc-500">Keyboard: <span className="font-semibold">←</span> previous, <span className="font-semibold">→</span> next</p>
            <div className="mt-3 space-y-2.5">
              {adjacent.previous ? (
                <Link href={`/our-courses/lesson/${encodeURIComponent(adjacent.previous.slug)}`} className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 hover:bg-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Previous</p>
                  <p className="mt-1 text-sm font-semibold leading-tight text-zinc-900">{adjacent.previous.title}</p>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-600">This is the first lesson.</div>
              )}

              {adjacent.next ? (
                <Link href={`/our-courses/lesson/${encodeURIComponent(adjacent.next.slug)}`} className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 hover:bg-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Next</p>
                  <p className="mt-1 text-sm font-semibold leading-tight text-zinc-900">{adjacent.next.title}</p>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-600">This is the final lesson.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm xl:sticky xl:top-4">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Chapter · Topics · Subtopics</p>
            <h3 className="mt-2 text-sm font-semibold text-zinc-900">{lesson.module}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Chapter {lesson.week} · {lesson.level}</p>
            <ul ref={topicListContainerRef} className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {moduleTopics.map((t) => {
                const isActiveLesson = isActiveLessonSidebarItem(t.slug, activeSidebarSlug);

                return (
                  <li key={t.slug}>
                    <Link
                      href={`/our-courses/lesson/${encodeURIComponent(t.slug)}`}
                      ref={isActiveLesson ? activeTopicLinkRef : undefined}
                      className="block rounded-md px-2.5 py-1.5 text-xs transition-colors text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 aria-[current=page]:border-l-4 aria-[current=page]:border-emerald-500 aria-[current=page]:bg-emerald-100 aria-[current=page]:font-bold aria-[current=page]:text-emerald-900 aria-[current=page]:ring-1 aria-[current=page]:ring-emerald-300"
                      aria-current={isActiveLesson ? 'page' : undefined}
                    >
                      <span className={isActiveLesson ? 'text-emerald-800' : 'text-zinc-500'}>{t.day} L{t.lessonNumber} · </span>
                      {t.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {!!lessonHeadings.length && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm xl:sticky xl:top-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Lesson Topic</p>
              <p className="mt-1 text-xs text-zinc-500">Highlight updates automatically as you scroll.</p>
              <ul className="mt-3 space-y-1.5">
                {lessonHeadings.map((heading) => {
                  const isActive = heading.id === activeHeadingId;
                  return (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-emerald-100 font-semibold text-emerald-800'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        } ${heading.level === 3 ? 'ml-3' : ''}`}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        {heading.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <Link href="/our-courses" className="flex items-center justify-center rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            All Courses
          </Link>
        </aside>
      </div>

      {chapterQuiz && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Chapter Complete · Quiz Unlocked
              </p>
              <h2 className="mt-2 text-lg font-bold text-zinc-900">
                Chapter {lesson?.week} Quiz · {chapterQuiz.chapterTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{chapterQuiz.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-emerald-700">
                  20 Multiple Choice
                </span>
                <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-emerald-700">
                  5 Fill in the Gap
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-zinc-600">
                  ~{chapterQuiz.estimatedMinutes} min · Answers shown after submission
                </span>
              </div>
            </div>
            <Link
              href={`/our-courses/quiz/${lesson?.week}`}
              className="shrink-0 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
            >
              Take Chapter Quiz →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">AI Learning Assistant</h2>
          <p className="text-xs text-zinc-500">Ask questions for this lesson and get instant clarification.</p>
        </div>

        <div className="min-h-[180px] max-h-72 space-y-3 overflow-y-auto p-4">
          {chatMessages.length === 0 && (
            <p className="text-sm text-zinc-600">Ask a question about this lesson to start a guided learning conversation.</p>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-700 text-white' : 'border border-zinc-200 bg-zinc-50 text-zinc-800'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-zinc-200 p-3">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendChatMessage();
                }
              }}
              placeholder={user ? 'Ask about this lesson...' : 'Sign in to use the AI assistant'}
              disabled={!user || chatLoading}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void sendChatMessage()}
              disabled={!user || chatLoading || !chatInput.trim()}
              className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
