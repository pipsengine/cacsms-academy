'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getLessonBySlug,
  getAdjacentLessons,
  getModuleLessons,
  type LessonRecord,
} from '@/lib/learning/curriculum';

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
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';

  const lesson = useMemo(() => getLessonBySlug(slug), [slug]);
  const adjacent = useMemo(() => (lesson ? getAdjacentLessons(lesson.slug) : { previous: null, next: null }), [lesson]);
  const moduleTopics = useMemo(
    () => (lesson ? getModuleLessons(lesson.week) : []),
    [lesson]
  );

  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitError, setUnitError] = useState<string | null>(null);
  const [lessonStatus, setLessonStatus] = useState<string>('not_started');
  const [markingComplete, setMarkingComplete] = useState(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load lesson unit content
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

  // Mark lesson as started and load existing progress
  useEffect(() => {
    if (!user || !lesson) return;

    fetch('/api/learning/progress')
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { progress?: Array<{ lessonSlug: string; status: string }> };
        const entry = data.progress?.find((p) => p.lessonSlug === lesson.slug);
        if (entry) setLessonStatus(entry.status);
      })
      .catch(() => undefined);

    // Mark as started if not already completed
    fetch('/api/learning/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonSlug: lesson.slug, status: 'started' }),
    }).catch(() => undefined);
  }, [user, lesson]);

  async function markComplete() {
    if (!user || !lesson) return;
    setMarkingComplete(true);
    try {
      const res = await fetch('/api/learning/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug: lesson.slug, status: 'completed' }),
      });
      if (res.ok) {
        setLessonStatus('completed');
        // Auto-navigate to next lesson after short delay
        if (adjacent.next) {
          setTimeout(() => {
            router.push(`/our-courses/lesson/${encodeURIComponent(adjacent.next!.slug)}`);
          }, 1200);
        }
      }
    } finally {
      setMarkingComplete(false);
    }
  }

  async function sendChatMessage() {
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
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!lesson) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl">
          <div className="rounded-xl border border-red-800 bg-red-950/30 p-6">
            <p className="font-semibold text-red-300">Lesson not found</p>
            <p className="mt-1 text-sm text-red-400">The lesson you are looking for does not exist.</p>
            <Link href="/our-courses" className="mt-4 inline-block text-sm font-semibold text-emerald-400 hover:text-emerald-300">
              ← Back to Courses
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/our-courses" className="hover:text-zinc-300">Our Courses</Link>
          <span>/</span>
          <span className="text-zinc-400">Week {lesson.week} · {lesson.module}</span>
          <span>/</span>
          <span className="text-zinc-200">{lesson.title}</span>
        </nav>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ── Main Content ── */}
          <div className="space-y-5">
            {/* Lesson Header */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  lesson.level === 'Beginner' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}>
                  {lesson.level}
                </span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                  {lesson.type === 'assignment' ? 'Assignment' : 'Lesson'}
                </span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                  Week {lesson.week} · {lesson.day}
                </span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                  Lesson {lesson.lessonNumber} of 3
                </span>
                {lessonStatus === 'completed' && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    ✓ Completed
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-xl font-bold text-zinc-100">{lesson.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{lesson.summary}</p>
              <p className="mt-2 text-xs text-zinc-500">Module: {lesson.module} · Day Theme: {lesson.dayTheme}</p>
            </div>

            {/* Lesson Content */}
            {unitLoading && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <p className="text-sm text-zinc-400">Loading lesson content…</p>
                </div>
              </div>
            )}

            {!unitLoading && unitError && (
              <div className="rounded-xl border border-red-800 bg-red-950/30 p-5">
                <p className="text-sm text-red-300">{unitError}</p>
              </div>
            )}

            {!unitLoading && unit && (
              <>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Lesson</h2>
                  <div className="prose prose-invert prose-zinc mt-4 max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300 prose-code:text-emerald-300 prose-pre:bg-zinc-950">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{unit.content}</ReactMarkdown>
                  </div>
                </div>

                {unit.example && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Practical Example</h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">{unit.example}</p>
                  </div>
                )}

                {unit.is_assignment && unit.assignment && (
                  <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Assignment Instructions</h2>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-100">{unit.assignment}</pre>
                  </div>
                )}
              </>
            )}

            {/* Complete / Next actions */}
            {!authLoading && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                {!user ? (
                  <p className="text-sm text-zinc-400">
                    <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">Sign in</Link>
                    {' '}to track your progress and mark lessons complete.
                  </p>
                ) : lessonStatus === 'completed' ? (
                  <>
                    <span className="text-sm font-semibold text-emerald-400">✓ Lesson Completed</span>
                    {adjacent.next && (
                      <Link
                        href={`/our-courses/lesson/${encodeURIComponent(adjacent.next.slug)}`}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        Next Lesson →
                      </Link>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => void markComplete()}
                    disabled={markingComplete || unitLoading}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {markingComplete ? 'Saving…' : 'Mark as Complete'}
                  </button>
                )}
                {lessonStatus !== 'completed' && adjacent.next && user && (
                  <Link
                    href={`/our-courses/lesson/${encodeURIComponent(adjacent.next.slug)}`}
                    className="text-sm text-zinc-400 hover:text-zinc-300"
                  >
                    Skip to next →
                  </Link>
                )}
              </div>
            )}

            {/* AI Chat Assistant */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="border-b border-zinc-800 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-semibold text-zinc-200">AI Learning Assistant</h2>
                  <span className="text-xs text-zinc-500">— Ask anything about this lesson</span>
                </div>
              </div>

              <div className="min-h-[180px] max-h-72 overflow-y-auto space-y-3 p-4">
                {chatMessages.length === 0 && (
                  <div className="text-sm text-zinc-500">
                    <p>Have a question about <span className="text-zinc-300">{lesson.title}</span>?</p>
                    <p className="mt-1">Ask the AI assistant — it understands this lesson&apos;s context.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        'Can you give me a real example?',
                        'Why does this matter for trading?',
                        'How do I apply this in practice?',
                      ].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => { setChatInput(q); }}
                          className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-700 text-white'
                          : 'border border-zinc-700 bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2.5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((n) => (
                          <div key={n} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: `${n * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-zinc-800 p-3">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendChatMessage(); } }}
                    placeholder={user ? 'Ask about this lesson…' : 'Sign in to use the AI assistant'}
                    disabled={!user || chatLoading}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500 disabled:opacity-50"
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
                {!user && (
                  <p className="mt-1.5 text-xs text-zinc-600">
                    <Link href="/login" className="text-emerald-500 hover:text-emerald-400">Sign in</Link>
                    {' '}to use the AI learning assistant.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-4">
            {/* Navigation */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Lesson Navigation</p>
              <div className="mt-3 space-y-2.5">
                {adjacent.previous ? (
                  <Link
                    href={`/our-courses/lesson/${encodeURIComponent(adjacent.previous.slug)}`}
                    className="block rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">← Previous</p>
                    <p className="mt-1 text-sm font-semibold leading-tight text-zinc-100">{adjacent.previous.title}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">Week {adjacent.previous.week} · {adjacent.previous.day}</p>
                  </Link>
                ) : (
                  <div className="rounded-lg border border-dashed border-zinc-800 p-3 text-xs text-zinc-600">
                    This is the first lesson.
                  </div>
                )}
                {adjacent.next ? (
                  <Link
                    href={`/our-courses/lesson/${encodeURIComponent(adjacent.next.slug)}`}
                    className="block rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">→ Next</p>
                    <p className="mt-1 text-sm font-semibold leading-tight text-zinc-100">{adjacent.next.title}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">Week {adjacent.next.week} · {adjacent.next.day}</p>
                  </Link>
                ) : (
                  <div className="rounded-lg border border-dashed border-zinc-800 p-3 text-xs text-zinc-600">
                    This is the final lesson.
                  </div>
                )}
              </div>
            </div>

            {/* Module Overview */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Module Overview</p>
              <h3 className="mt-2 text-sm font-semibold text-zinc-100">{lesson.module}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">Week {lesson.week} · {lesson.level}</p>
              <ul className="mt-3 space-y-1.5">
                {moduleTopics.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/our-courses/lesson/${encodeURIComponent(t.slug)}`}
                      className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                        t.slug === lesson.slug
                          ? 'bg-emerald-900/30 font-semibold text-emerald-300'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-zinc-600">{t.day} L{t.lessonNumber} · </span>
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Back link */}
            <Link
              href="/our-courses"
              className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              ← All Courses
            </Link>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
