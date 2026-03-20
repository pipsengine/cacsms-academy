'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/components/AuthProvider';
import LearningProgressChips from '@/components/LearningProgressChips';
import { trackLearningEvent } from '@/lib/learning/analytics';
import { getAdjacentLessons, getLessonBySlug, getModuleLessons } from '@/lib/learning/curriculum';

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

export default function LessonPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const slugParam = params?.slug;
  const rawSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';

  const lesson = useMemo(() => getLessonBySlug(slug), [slug]);
  const adjacent = useMemo(() => (lesson ? getAdjacentLessons(lesson.slug) : { previous: null, next: null }), [lesson]);
  const moduleTopics = useMemo(() => (lesson ? getModuleLessons(lesson.week) : []), [lesson]);

  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError] = useState<string | null>(null);
  const [lessonStatus, setLessonStatus] = useState<string>('not_started');
  const [markingComplete, setMarkingComplete] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Lesson</h2>
                <div className="prose prose-zinc mt-4 max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-li:text-zinc-700 prose-code:text-emerald-700 prose-pre:bg-zinc-100">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{unit.content}</ReactMarkdown>
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

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Chapter · Topics · Subtopics</p>
            <h3 className="mt-2 text-sm font-semibold text-zinc-900">{lesson.module}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Chapter {lesson.week} · {lesson.level}</p>
            <ul className="mt-3 space-y-1.5">
              {moduleTopics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/our-courses/lesson/${encodeURIComponent(t.slug)}`}
                    className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                      t.slug === lesson.slug ? 'bg-emerald-100 font-semibold text-emerald-800' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <span className="text-zinc-500">{t.day} L{t.lessonNumber} · </span>
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/our-courses" className="flex items-center justify-center rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            All Courses
          </Link>
        </aside>
      </div>

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
