'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/components/AuthProvider';
import LearningProgressChips from '@/components/LearningProgressChips';
import { trackLearningEvent } from '@/lib/learning/analytics';
import { getAdjacentLessons, getAllLessons, getLessonBySlug, getModuleLessons } from '@/lib/learning/curriculum';
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

type LessonTopicSlide = {
  id: string;
  title: string;
  markdown: string;
};

type SlideTransitionStyle = 'fade' | 'push' | 'zoom';

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSemanticTopicSlides(content: string, lessonTitle: string, sections: string[] = []): LessonTopicSlide[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const sectionTitles = sections
    .map((section) => section.trim())
    .filter(Boolean);
  const sectionMatchers = sectionTitles.map((section) => new RegExp(`^${escapeRegExp(section)}:?$`, 'i'));
  const commonPlainHeadings = new Set([
    'introduction',
    'key concepts',
    'market context',
    'trading implication',
    'trading implications',
    'example',
    'summary',
    'action steps',
    'risk notes',
    'checklist',
    'takeaway',
    'takeaways',
  ]);

  const lines = trimmed.split('\n');
  const slides: Array<{ title: string; markdown: string }> = [];
  let currentTitle = lessonTitle || 'Lesson Overview';
  let currentLines: string[] = [];

  const pushCurrent = () => {
    const markdown = currentLines.join('\n').trim();
    if (!markdown) return;
    slides.push({ title: currentTitle || `Topic ${slides.length + 1}`, markdown });
    currentLines = [];
  };

  const isHeadingCandidate = (line: string) => {
    const normalized = line.trim().toLowerCase().replace(/:$/, '');
    if (!normalized) return false;
    if (commonPlainHeadings.has(normalized)) return true;
    return sectionMatchers.some((matcher) => matcher.test(line.trim()));
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();
    const prevLine = index > 0 ? lines[index - 1].trim() : '';
    const nextLine = index < lines.length - 1 ? lines[index + 1].trim() : '';
    const markdownHeadingMatch = /^(#{2,3})\s+(.+)$/.exec(trimmedLine);
    const looksLikePlainHeading =
      Boolean(trimmedLine) &&
      !markdownHeadingMatch &&
      !/^[-*+]\s+|^\d+\.\s+/.test(trimmedLine) &&
      /^[A-Z][A-Za-z0-9\s&()/'\-:,]{2,90}$/.test(trimmedLine) &&
      !/[.!?]$/.test(trimmedLine) &&
      prevLine.length === 0 &&
      nextLine.length > 0 &&
      (isHeadingCandidate(trimmedLine) || trimmedLine.split(/\s+/).length <= 7);

    if (markdownHeadingMatch) {
      pushCurrent();
      currentTitle = markdownHeadingMatch[2].trim();
      currentLines = [line];
      continue;
    }

    if (looksLikePlainHeading) {
      pushCurrent();
      currentTitle = trimmedLine.replace(/:$/, '').trim();
      currentLines = [`## ${currentTitle}`];
      continue;
    }

    currentLines.push(line);
  }

  pushCurrent();

  if (!slides.length) {
    return [{ id: 'lesson-overview', title: lessonTitle || 'Lesson Overview', markdown: trimmed }];
  }

  const idCounts = new Map<string, number>();
  return slides.map((slide, index) => {
    const baseId = headingSlug(slide.title || `topic-${index + 1}`) || `topic-${index + 1}`;
    const existing = idCounts.get(baseId) ?? 0;
    idCounts.set(baseId, existing + 1);
    const id = existing === 0 ? baseId : `${baseId}-${existing + 1}`;
    return {
      id,
      title: slide.title || `Topic ${index + 1}`,
      markdown: slide.markdown,
    };
  });
}

function splitOversizedBlock(block: string, maxChars: number): string[] {
  if (block.length <= maxChars) return [block];

  const packedFrom = (parts: string[]) => {
    const filteredParts = parts.map((part) => part.trim()).filter(Boolean);
    if (!filteredParts.length) return [block];

    const chunks: string[] = [];
    let active = '';
    for (const part of filteredParts) {
      const candidate = active ? `${active}\n\n${part}` : part;
      if (candidate.length <= maxChars || !active) {
        active = candidate;
      } else {
        chunks.push(active);
        active = part;
      }
    }
    if (active) chunks.push(active);
    return chunks;
  };

  const listParts = block.split(/\n(?=\s*(?:[-*+]\s+|\d+\.\s+))/).map((item) => item.trim()).filter(Boolean);
  if (listParts.length > 1) return packedFrom(listParts);

  const paragraphParts = block.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  if (paragraphParts.length > 1) return packedFrom(paragraphParts);

  const sentenceParts = block.split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean);
  if (sentenceParts.length > 1) return packedFrom(sentenceParts);

  return [block];
}

function splitMarkdownIntoSlidePages(markdown: string, maxChars = 850): string[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [''];

  // Keep fenced code blocks and list groups intact so slides don't split mid-structure.
  const lines = trimmed.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;

  const flushCurrent = () => {
    const block = current.join('\n').trim();
    if (block) blocks.push(block);
    current = [];
  };

  for (const rawLine of lines) {
    const line = rawLine;
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      inFence = !inFence;
      current.push(line);
      continue;
    }

    if (inFence) {
      current.push(line);
      continue;
    }

    const isBlank = trimmedLine.length === 0;
    const isListLine = /^[-*+]\s+|^\d+\.\s+|^>\s+/.test(trimmedLine);

    if (isBlank) {
      // Keep list groups together by retaining single blank lines inside lists.
      if (current.length && /^[-*+]\s+|^\d+\.\s+|^>\s+/.test((current.at(-1) ?? '').trim())) {
        current.push(line);
      } else {
        flushCurrent();
      }
      continue;
    }

    if (isListLine && current.length && !/^[-*+]\s+|^\d+\.\s+|^>\s+/.test((current.at(-1) ?? '').trim())) {
      flushCurrent();
      current.push(line);
      continue;
    }

    current.push(line);
  }

  flushCurrent();

  if (!blocks.length) return [trimmed];

  const pages: string[] = [];
  let currentPage = '';

  for (const block of blocks) {
    const blockParts = splitOversizedBlock(block, maxChars);
    for (const part of blockParts) {
      const candidate = currentPage ? `${currentPage}\n\n${part}` : part;
      if (candidate.length <= maxChars || !currentPage) {
        currentPage = candidate;
        continue;
      }

      pages.push(currentPage);
      currentPage = part;
    }
  }

  if (currentPage) pages.push(currentPage);
  return pages.length ? pages : [trimmed];
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
  const allLessons = useMemo(() => getAllLessons(), []);
  const currentLessonPosition = lesson ? lesson.lessonIndex + 1 : 0;
  const totalLessons = allLessons.length;
  const completionPercent = totalLessons ? Math.round((currentLessonPosition / totalLessons) * 100) : 0;

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
  const [lessonProgressBySlug, setLessonProgressBySlug] = useState<Record<string, string>>({});
  const [markingComplete, setMarkingComplete] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [slideMode, setSlideMode] = useState(false);
  const [isSlideTransitioning, setIsSlideTransitioning] = useState(false);
  const [slideTransitionStyle, setSlideTransitionStyle] = useState<SlideTransitionStyle>('fade');
  const [currentTopicSlideIndex, setCurrentTopicSlideIndex] = useState(0);
  const [currentTopicPageIndex, setCurrentTopicPageIndex] = useState(0);
  const [topicMotionEnabled, setTopicMotionEnabled] = useState(true);
  const [topicContentVisible, setTopicContentVisible] = useState(true);
  const [isSlideNavigatorExpanded, setIsSlideNavigatorExpanded] = useState(false);

  const lessonContentRef = useRef<HTMLDivElement>(null);
  const topicListContainerRef = useRef<HTMLUListElement>(null);
  const activeTopicLinkRef = useRef<HTMLAnchorElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeTimelineChipRef = useRef<HTMLButtonElement | null>(null);
  const activeTopicSlideChipRef = useRef<HTMLButtonElement | null>(null);

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

  const lessonTopicSlides = useMemo<LessonTopicSlide[]>(() => {
    const content = unit?.content?.trim();
    if (!content) return [];
    return buildSemanticTopicSlides(content, lesson?.title ?? 'Lesson Overview', unit?.sections ?? []);
  }, [lesson?.title, unit?.content, unit?.sections]);

  const totalTopicSlides = lessonTopicSlides.length || 1;
  const activeTopicSlide = lessonTopicSlides[currentTopicSlideIndex] ?? null;
  const activeTopicPages = useMemo(
    () => splitMarkdownIntoSlidePages(activeTopicSlide?.markdown ?? '', 720),
    [activeTopicSlide?.markdown]
  );
  const totalTopicPages = activeTopicPages.length || 1;
  const activeTopicPageMarkdown = activeTopicPages[currentTopicPageIndex] ?? activeTopicPages[0] ?? '';
  const topicSlideProgressPct = totalTopicSlides
    ? Math.round(((currentTopicSlideIndex + 1) / totalTopicSlides) * 100)
    : 0;
  const topicPageProgressPct = totalTopicPages
    ? Math.round(((currentTopicPageIndex + 1) / totalTopicPages) * 100)
    : 0;
  const canGoPreviousPage = currentTopicPageIndex > 0;
  const canGoNextPage = currentTopicPageIndex < totalTopicPages - 1;
  const canGoPreviousSlide = canGoPreviousPage || currentTopicSlideIndex > 0 || Boolean(adjacent.previous);
  const canGoNextSlide = canGoNextPage || currentTopicSlideIndex < totalTopicSlides - 1 || Boolean(adjacent.next);

  const shouldShowVisualExplainer = isCandlestickLesson;
  const chapterCompletedCount = useMemo(
    () => moduleTopics.filter((topic) => lessonProgressBySlug[topic.slug] === 'completed').length,
    [lessonProgressBySlug, moduleTopics]
  );

  const slideTypographyClass = useMemo(() => {
    const contentLength = activeTopicPageMarkdown.length || (unit?.content?.length ?? 0);
    if (contentLength > 640) return 'text-[15px] leading-[1.42]';
    if (contentLength > 520) return 'text-[15.5px] leading-[1.46]';
    if (contentLength > 400) return 'text-[16px] leading-[1.5]';
    return 'text-[17px] leading-[1.55]';
  }, [activeTopicPageMarkdown, unit?.content]);

  const slideTransitionClass = useMemo(() => {
    if (!isSlideTransitioning) return 'translate-y-0 opacity-100 scale-100';
    if (slideTransitionStyle === 'push') return 'translate-x-4 opacity-0';
    if (slideTransitionStyle === 'zoom') return 'scale-[0.985] opacity-0';
    return 'translate-y-1 opacity-0';
  }, [isSlideTransitioning, slideTransitionStyle]);

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
        const progressLookup = Object.fromEntries((data.progress ?? []).map((entry) => [entry.lessonSlug, entry.status]));
        setLessonProgressBySlug(progressLookup);
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
      setLessonProgressBySlug((current) => ({ ...current, [lesson.slug]: 'completed' }));
      if (adjacent.next) {
        setIsSlideTransitioning(true);
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
    if (!slideMode) return;
    activeTimelineChipRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [lesson?.slug, slideMode]);

  useEffect(() => {
    if (!slideMode) return;
    activeTopicSlideChipRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentTopicSlideIndex, slideMode]);

  useEffect(() => {
    setCurrentTopicSlideIndex(0);
  }, [lesson?.slug, unit?.content]);

  useEffect(() => {
    setCurrentTopicPageIndex(0);
  }, [activeTopicSlide?.id, lesson?.slug]);

  useEffect(() => {
    if (!slideMode || !topicMotionEnabled) {
      setTopicContentVisible(true);
      return;
    }

    setTopicContentVisible(false);
    const timer = window.setTimeout(() => {
      setTopicContentVisible(true);
    }, 20);

    return () => window.clearTimeout(timer);
  }, [currentTopicSlideIndex, lesson?.slug, slideMode, topicMotionEnabled]);

  useEffect(() => {
    setIsSlideTransitioning(false);
  }, [slug]);

  useEffect(() => {
    if (!slideMode) {
      setIsSlideNavigatorExpanded(false);
    }
  }, [slideMode]);

  const navigateToLesson = useCallback(
    (targetSlug: string, direction: 'previous' | 'next' | 'direct' = 'direct') => {
      if (isSlideTransitioning) return;
      setIsSlideTransitioning(true);

      if (lesson) {
        void trackLearningEvent({
          eventType: 'lesson_navigation_clicked',
          route: `/our-courses/lesson/${encodeURIComponent(lesson.slug)}`,
          lessonSlug: lesson.slug,
          week: lesson.week,
          day: lesson.day,
          metadata: { direction },
        });
      }

      window.setTimeout(() => {
        router.push(`/our-courses/lesson/${encodeURIComponent(targetSlug)}`);
      }, 180);

      // Safety: release transition lock even if route push is interrupted.
      window.setTimeout(() => {
        setIsSlideTransitioning(false);
      }, 1200);
    },
    [isSlideTransitioning, lesson, router]
  );

  const navigateToTopicSlide = useCallback(
    (targetIndex: number) => {
      if (isSlideTransitioning) return;
      if (targetIndex < 0 || targetIndex >= lessonTopicSlides.length) return;
      if (targetIndex === currentTopicSlideIndex) return;

      setIsSlideTransitioning(true);
      window.setTimeout(() => {
        setCurrentTopicSlideIndex(targetIndex);
        setIsSlideTransitioning(false);
      }, 140);
    },
    [currentTopicSlideIndex, isSlideTransitioning, lessonTopicSlides.length]
  );

  const navigateToTopicPage = useCallback(
    (targetIndex: number) => {
      if (isSlideTransitioning) return;
      if (targetIndex < 0 || targetIndex >= activeTopicPages.length) return;
      if (targetIndex === currentTopicPageIndex) return;

      setIsSlideTransitioning(true);
      window.setTimeout(() => {
        setCurrentTopicPageIndex(targetIndex);
        setIsSlideTransitioning(false);
      }, 120);
    },
    [activeTopicPages.length, currentTopicPageIndex, isSlideTransitioning]
  );

  const goPreviousSlide = useCallback(() => {
    if (slideMode && canGoPreviousPage) {
      navigateToTopicPage(currentTopicPageIndex - 1);
      return;
    }
    if (slideMode && currentTopicSlideIndex > 0) {
      navigateToTopicSlide(currentTopicSlideIndex - 1);
      return;
    }
    if (adjacent.previous) {
      navigateToLesson(adjacent.previous.slug, 'previous');
    }
  }, [adjacent.previous, canGoPreviousPage, currentTopicPageIndex, currentTopicSlideIndex, navigateToLesson, navigateToTopicPage, navigateToTopicSlide, slideMode]);

  const goNextSlide = useCallback(() => {
    if (slideMode && canGoNextPage) {
      navigateToTopicPage(currentTopicPageIndex + 1);
      return;
    }
    if (slideMode && currentTopicSlideIndex < totalTopicSlides - 1) {
      navigateToTopicSlide(currentTopicSlideIndex + 1);
      return;
    }
    if (adjacent.next) {
      navigateToLesson(adjacent.next.slug, 'next');
    }
  }, [adjacent.next, canGoNextPage, currentTopicPageIndex, currentTopicSlideIndex, navigateToLesson, navigateToTopicPage, navigateToTopicSlide, slideMode, totalTopicSlides]);

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

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        if (!canGoPreviousSlide) return;

        void trackLearningEvent({
          eventType: 'keyboard_navigation_used',
          route: `/our-courses/lesson/${encodeURIComponent(lesson?.slug ?? '')}`,
          lessonSlug: lesson?.slug,
          week: lesson?.week,
          day: lesson?.day,
          metadata: { direction: 'previous' },
        });
        goPreviousSlide();
      }

      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        if (!canGoNextSlide) return;

        void trackLearningEvent({
          eventType: 'keyboard_navigation_used',
          route: `/our-courses/lesson/${encodeURIComponent(lesson?.slug ?? '')}`,
          lessonSlug: lesson?.slug,
          week: lesson?.week,
          day: lesson?.day,
          metadata: { direction: 'next' },
        });
        goNextSlide();
      }

      if (event.key === 'Escape') {
        setSlideMode(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canGoNextSlide, canGoPreviousSlide, goNextSlide, goPreviousSlide, lesson?.day, lesson?.slug, lesson?.week]);

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
    <div className={slideMode ? 'fixed inset-0 z-50 flex h-screen flex-col overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-zinc-50 p-4 sm:p-6' : 'max-w-7xl'}>
      {!slideMode && (
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/our-courses" className="hover:text-zinc-700">Learning Home</Link>
          <span>/</span>
          <span className="text-zinc-600">Chapter {lesson.week} · {lesson.module}</span>
          <span>/</span>
          <span className="text-zinc-800">{lesson.title}</span>
        </nav>
      )}

      <div className={`mb-5 overflow-hidden rounded-2xl border shadow-sm ${slideMode ? 'border-emerald-200 bg-white text-zinc-900' : 'border-zinc-200 bg-white'}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${slideMode ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50/80'}`}>
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${slideMode ? 'text-emerald-600' : 'text-zinc-500'}`}>Presentation Reader</p>
            <p className={`mt-1 text-sm font-semibold ${slideMode ? 'text-zinc-900' : 'text-zinc-800'}`}>
              Slide {currentLessonPosition} of {totalLessons} · {completionPercent}% through full course
            </p>
            {slideMode && (
              <p className="mt-1 text-xs text-zinc-600">
                Topic {currentTopicSlideIndex + 1}/{totalTopicSlides} · Page {currentTopicPageIndex + 1}/{totalTopicPages}{activeTopicSlide ? ` · ${activeTopicSlide.title}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs ${slideMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
            Controls: <span className="font-semibold">← / →</span>, <span className="font-semibold">PgUp / PgDn</span>, <span className="font-semibold">Space</span>
            </div>
            <label className={`hidden items-center gap-1 rounded-md border px-2 py-1 text-[11px] sm:flex ${slideMode ? 'border-emerald-200 bg-white text-zinc-700' : 'border-zinc-200 bg-white text-zinc-600'}`}>
              <span>Transition</span>
              <select
                value={slideTransitionStyle}
                onChange={(event) => setSlideTransitionStyle(event.target.value as SlideTransitionStyle)}
                className={`rounded border px-1.5 py-0.5 text-[11px] ${slideMode ? 'border-emerald-200 bg-white text-zinc-700' : 'border-zinc-300 bg-white text-zinc-700'}`}
              >
                <option value="fade">Fade</option>
                <option value="push">Push</option>
                <option value="zoom">Zoom</option>
              </select>
            </label>
            {slideMode && (
              <button
                type="button"
                onClick={() => setTopicMotionEnabled((current) => !current)}
                className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${topicMotionEnabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600'}`}
              >
                {topicMotionEnabled ? 'Motion On' : 'Motion Off'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setSlideMode((current) => !current)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${slideMode ? 'border border-emerald-200 bg-white text-zinc-700 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
            >
              {slideMode ? 'Exit Slide Mode (Esc)' : 'Enter Slide Mode'}
            </button>
          </div>
        </div>
        <div className={`h-1.5 w-full ${slideMode ? 'bg-emerald-100' : 'bg-zinc-100'}`}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-[width] duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className={`grid gap-6 transition-all duration-200 ${slideTransitionClass} ${slideMode ? 'flex-1 grid-cols-1 overflow-hidden' : 'xl:grid-cols-[minmax(0,1fr)_320px]'}`}>
        <div className="space-y-5">
          {!slideMode && (
          <div className={`rounded-2xl border p-5 shadow-sm ${slideMode ? 'border-emerald-200 bg-white text-zinc-900' : 'border-zinc-200 bg-gradient-to-br from-white via-white to-emerald-50/30'}`}>
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
            <h1 className={`mt-3 text-xl font-bold ${slideMode ? 'text-zinc-900' : 'text-zinc-900'}`}>{lesson.title}</h1>
            <p className={`mt-2 text-sm leading-relaxed ${slideMode ? 'text-zinc-700' : 'text-zinc-700'}`}>{lesson.summary}</p>
            <p className={`mt-2 text-xs ${slideMode ? 'text-zinc-500' : 'text-zinc-500'}`}>Topic Theme: {lesson.dayTheme}</p>
            <LearningProgressChips week={lesson.week} day={lesson.day} currentLessonSlug={lesson.slug} />
          </div>
          )}

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
              {!slideMode && shouldShowVisualExplainer && (
                <div className={`rounded-xl border p-5 shadow-sm ${slideMode ? 'border-emerald-200 bg-white' : 'border-zinc-200 bg-white'}`}>
                  <h2 className={`text-sm font-semibold uppercase tracking-[0.2em] ${slideMode ? 'text-emerald-600' : 'text-zinc-500'}`}>Visual Explainer</h2>
                  <p className={`mt-2 text-sm leading-relaxed ${slideMode ? 'text-zinc-700' : 'text-zinc-700'}`}>{unit.image_prompt}</p>
                  <div className="mt-4">
                    <CandlestickVisualDiagram />
                  </div>
                </div>
              )}

              <div className={`relative rounded-2xl border p-5 shadow-sm ${slideMode ? 'h-full border-emerald-200 bg-white overflow-hidden' : 'border-zinc-200 bg-white'}`}>
                <div className={slideMode ? 'pointer-events-auto absolute left-1/2 top-4 z-10 w-[min(92%,64rem)] -translate-x-1/2' : ''}>
                  <h2 className={`text-sm font-semibold uppercase tracking-[0.2em] ${slideMode ? 'text-center text-emerald-600' : 'text-zinc-500'}`}>
                    {slideMode ? `Topic ${currentTopicSlideIndex + 1}/${totalTopicSlides} · Page ${currentTopicPageIndex + 1}/${totalTopicPages}` : 'Detailed Lesson'}
                  </h2>
                  {slideMode && activeTopicSlide && (
                    <p className="mt-2 text-center text-sm font-semibold text-zinc-800">{activeTopicSlide.title}</p>
                  )}

                </div>
                <div className={slideMode ? 'mt-4 flex flex-1 items-center justify-center' : ''}>
                  <div
                    ref={lessonContentRef}
                    className={`prose max-w-none scroll-mt-24 transition-all duration-300 ${slideMode ? `${slideTypographyClass} mx-auto w-full max-w-5xl min-h-[48vh] max-h-[66vh] overflow-hidden pt-7 prose-p:my-2 prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 prose-headings:mb-2 prose-headings:mt-3 prose-h1:text-[1.05em] prose-h2:text-[1.03em] prose-h3:text-[1.01em]` : 'mt-4 text-[15px] leading-7'} ${slideMode && topicMotionEnabled ? (topicContentVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0') : 'translate-y-0 opacity-100'} prose-zinc prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-li:text-zinc-700 prose-code:text-emerald-700 prose-pre:bg-zinc-100 prose-headings:font-bold`}
                  >
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
                      {slideMode && activeTopicSlide ? activeTopicPageMarkdown : unit.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {slideMode && (
                  <>
                    {(canGoPreviousPage || currentTopicSlideIndex > 0 || adjacent.previous) && (
                      <button
                        type="button"
                        onClick={goPreviousSlide}
                        className="absolute left-0 top-0 h-full w-12 rounded-l-2xl bg-transparent text-transparent transition-colors hover:bg-emerald-100/70 md:w-16"
                        aria-label="Go to previous slide"
                      />
                    )}
                    {(canGoNextPage || currentTopicSlideIndex < totalTopicSlides - 1 || adjacent.next) && (
                      <button
                        type="button"
                        onClick={goNextSlide}
                        className="absolute right-0 top-0 h-full w-12 rounded-r-2xl bg-transparent text-transparent transition-colors hover:bg-emerald-100/70 md:w-16"
                        aria-label="Go to next slide"
                      />
                    )}
                  </>
                )}
              </div>

              {!slideMode && unit.example && (
                <div className={`rounded-xl border p-5 shadow-sm ${slideMode ? 'border-emerald-200 bg-white' : 'border-zinc-200 bg-white'}`}>
                  <h2 className={`text-sm font-semibold uppercase tracking-[0.2em] ${slideMode ? 'text-emerald-600' : 'text-zinc-500'}`}>Practical Example</h2>
                  <p className={`mt-3 text-sm leading-relaxed ${slideMode ? 'text-zinc-700' : 'text-zinc-700'}`}>{unit.example}</p>
                </div>
              )}

              {!slideMode && unit.is_assignment && unit.assignment && (
                <div className={`rounded-xl border p-5 ${slideMode ? 'border-amber-200 bg-amber-50' : 'border-amber-200 bg-amber-50'}`}>
                  <h2 className={`text-sm font-semibold uppercase tracking-[0.2em] ${slideMode ? 'text-amber-700' : 'text-amber-700'}`}>Assignment Instructions</h2>
                  <pre className={`mt-3 whitespace-pre-wrap text-sm leading-relaxed ${slideMode ? 'text-amber-900' : 'text-amber-900'}`}>{unit.assignment}</pre>
                </div>
              )}
            </>
          )}

          {!authLoading && !slideMode && (
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
                    <button
                      type="button"
                      onClick={() => navigateToLesson(adjacent.next!.slug, 'next')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                      Next Lesson →
                    </button>
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

        {!slideMode && (
        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Navigation</p>
            <p className="mt-2 text-[11px] text-zinc-500">Keyboard: <span className="font-semibold">←</span> previous, <span className="font-semibold">→</span> next</p>
            <div className="mt-3 space-y-2.5">
              {adjacent.previous ? (
                <button
                  type="button"
                  onClick={() => navigateToLesson(adjacent.previous!.slug, 'previous')}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left hover:border-zinc-300 hover:bg-white"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Previous</p>
                  <p className="mt-1 text-sm font-semibold leading-tight text-zinc-900">{adjacent.previous.title}</p>
                </button>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-600">This is the first lesson.</div>
              )}

              {adjacent.next ? (
                <button
                  type="button"
                  onClick={() => navigateToLesson(adjacent.next!.slug, 'next')}
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left hover:border-zinc-300 hover:bg-white"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Next</p>
                  <p className="mt-1 text-sm font-semibold leading-tight text-zinc-900">{adjacent.next.title}</p>
                </button>
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
        )}
      </div>

      <div className={`${slideMode ? 'mt-3 shrink-0 rounded-xl border border-emerald-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm' : 'mt-5 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm'}`}>
        {slideMode && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Reader Controls</p>
            <button
              type="button"
              onClick={() => setIsSlideNavigatorExpanded((current) => !current)}
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              {isSlideNavigatorExpanded ? 'Hide Navigator' : 'Show Navigator'}
            </button>
          </div>
        )}

        {slideMode && isSlideNavigatorExpanded && totalTopicSlides > 1 && (
          <div className="mb-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-zinc-600">
              <span>In-Lesson Topic Navigator</span>
              <span>{topicSlideProgressPct}%</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-[width] duration-300"
                style={{ width: `${topicSlideProgressPct}%` }}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {lessonTopicSlides.map((topicSlide, index) => {
                const isActiveTopicSlide = index === currentTopicSlideIndex;
                return (
                  <button
                    key={topicSlide.id}
                    type="button"
                    ref={isActiveTopicSlide ? activeTopicSlideChipRef : undefined}
                    onClick={() => navigateToTopicSlide(index)}
                    className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                      isActiveTopicSlide
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
                    }`}
                    title={topicSlide.title}
                  >
                    T{index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {slideMode && isSlideNavigatorExpanded && totalTopicPages > 1 && (
          <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-zinc-600">
              <span>Topic Page Navigator</span>
              <span>{topicPageProgressPct}%</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-[width] duration-300"
                style={{ width: `${topicPageProgressPct}%` }}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {activeTopicPages.map((_, pageIndex) => {
                const isActivePage = pageIndex === currentTopicPageIndex;
                return (
                  <button
                    key={`page-${pageIndex + 1}`}
                    type="button"
                    onClick={() => navigateToTopicPage(pageIndex)}
                    className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                      isActivePage
                        ? 'border-cyan-300 bg-cyan-100 text-cyan-800'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    P{pageIndex + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {canGoPreviousSlide ? (
            <button
              type="button"
              onClick={goPreviousSlide}
              className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-colors ${slideMode ? 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-white' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-white'}`}
            >
              {slideMode && canGoPreviousPage ? '← Previous Page' : slideMode && currentTopicSlideIndex > 0 ? '← Previous Topic' : '← Previous Lesson'}
            </button>
          ) : (
            <div className={`rounded-lg border border-dashed px-3 py-2 text-center text-xs ${slideMode ? 'border-zinc-300 text-zinc-500' : 'border-zinc-300 text-zinc-500'}`}>
              Start Slide
            </div>
          )}

          {!slideMode && (
            <button
              type="button"
              onClick={() => setSlideMode(true)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Focus Mode
            </button>
          )}

          {canGoNextSlide ? (
            <button
              type="button"
              onClick={goNextSlide}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-500"
            >
              {slideMode && canGoNextPage ? 'Next Page →' : slideMode && currentTopicSlideIndex < totalTopicSlides - 1 ? 'Next Topic →' : 'Next Lesson →'}
            </button>
          ) : (
            <div className={`rounded-lg border border-dashed px-3 py-2 text-center text-xs ${slideMode ? 'border-zinc-300 text-zinc-500' : 'border-zinc-300 text-zinc-500'}`}>
              Final Slide
            </div>
          )}
        </div>

        {slideMode && isSlideNavigatorExpanded && (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Chapter Timeline</p>
              <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                {chapterCompletedCount}/{moduleTopics.length} completed
              </span>
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Completed</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" />In progress</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-300" />Upcoming</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {moduleTopics.map((topic) => {
                const isActive = topic.slug === lesson.slug;
                const progressState = lessonProgressBySlug[topic.slug] ?? 'not_started';
                const isCompleted = progressState === 'completed';
                const isStarted = progressState === 'started';
                return (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => navigateToLesson(topic.slug, 'direct')}
                    ref={isActive ? activeTimelineChipRef : undefined}
                    className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                      isActive
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                        : isCompleted
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : isStarted
                            ? 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
                    }`}
                    title={`${topic.day} · Lesson ${topic.lessonNumber} · ${topic.title}`}
                  >
                    {isCompleted ? '✓ ' : ''}{topic.day.slice(0, 3)} L{topic.lessonNumber}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isSlideTransitioning && (
        <div className="pointer-events-none fixed inset-0 z-[60] bg-emerald-100/35 backdrop-blur-[1px]" aria-hidden="true" />
      )}

      {!slideMode && chapterQuiz && (
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

      {!slideMode && (
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
      )}
    </div>
  );
}
