'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getAdjacentCurriculumTopics,
  getAllCurriculumTopics,
  getCurriculumTopicRecord,
  getCurriculumTopicRecordBySlug,
  type CurriculumDay,
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

export default function ForexCourseUnitReadMore() {
  const searchParams = useSearchParams();
  const getParam = (key: string) => searchParams?.get(key) ?? null;
  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedDay = useMemo<CurriculumDay>(() => {
    const dayValue = getParam('day_of_week');
    const validDays: CurriculumDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return validDays.find((day) => day === dayValue) ?? 'Monday';
  }, [searchParams]);

  const topicRecord = useMemo(() => {
    const slug = getParam('slug');
    if (slug) {
      const bySlug = getCurriculumTopicRecordBySlug(slug);
      if (bySlug) return bySlug;
    }

    const weekNumber = Number(getParam('week_number') ?? 1);
    const safeWeek = Number.isFinite(weekNumber) ? weekNumber : 1;
    return getCurriculumTopicRecord(safeWeek, normalizedDay);
  }, [normalizedDay, searchParams]);

  const query = useMemo(() => {
    const topicTitle = topicRecord?.title ?? getParam('topic_title') ?? 'Support and Resistance Fundamentals';
    const weekNumber = topicRecord?.week ?? Number(getParam('week_number') ?? 1);
    const dayOfWeek = topicRecord?.day ?? normalizedDay;
    const topicType = topicRecord?.isAssignment ? 'assignment' : getParam('topic_type') ?? 'lesson';

    return {
      topic_title: topicTitle,
      week_number: Number.isFinite(weekNumber) ? weekNumber : 1,
      day_of_week: dayOfWeek,
      topic_type: topicType,
    };
  }, [normalizedDay, searchParams, topicRecord]);

  const adjacentTopics = useMemo(
    () => (topicRecord ? getAdjacentCurriculumTopics(topicRecord.slug) : { previous: null, next: null }),
    [topicRecord]
  );

  const relatedTopics = useMemo(() => {
    if (!topicRecord) return [];
    return getAllCurriculumTopics()
      .filter((topic) => topic.module === topicRecord.module && topic.slug !== topicRecord.slug)
      .slice(0, 5);
  }, [topicRecord]);

  useEffect(() => {
    async function loadUnit() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({
          topic_title: query.topic_title,
          week_number: String(query.week_number),
          day_of_week: query.day_of_week,
          topic_type: query.topic_type,
        });

        const res = await fetch(`/api/learning/unit?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

        const payload = (await res.json()) as CourseUnit;
        setUnit(payload);
      } catch {
        setUnit(null);
        setError('Unable to load the detailed lesson right now. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    void loadUnit();
  }, [query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Topic Environment</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900">{query.topic_title}</h2>
          {topicRecord?.summary && <p className="mt-3 text-sm leading-7 text-zinc-600">{topicRecord.summary}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">Chapter {query.week_number}</span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">Topic {query.day_of_week}</span>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">
              {query.topic_type === 'assignment' ? 'Assignment Topic' : 'Lesson Topic'}
            </span>
            {topicRecord?.level && (
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">{topicRecord.level}</span>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
            Loading full lesson content...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && unit && (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {unit.difficulty_level}
                </span>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  {unit.is_assignment ? 'Assignment Lesson' : 'Lesson'}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-zinc-900">{unit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{unit.summary}</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Lesson</h4>
              <div className="prose prose-zinc mt-4 max-w-none prose-headings:font-bold prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-strong:text-zinc-900 prose-li:text-zinc-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{unit.content}</ReactMarkdown>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Practical Example</h4>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">{unit.example}</p>
            </div>

            {unit.is_assignment && unit.assignment && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Assignment Instructions</h4>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-900">{unit.assignment}</pre>
              </div>
            )}
          </>
        )}

        <div>
          <Link href="/our-courses" className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Back to Course Home
          </Link>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Topic Navigation</p>
          <div className="mt-4 space-y-3">
            {adjacentTopics.previous ? (
              <Link href={`/our-courses/lesson/${encodeURIComponent(adjacentTopics.previous.slug)}`} className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 hover:bg-white">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Previous Topic</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">{adjacentTopics.previous.title}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600">
                You are at the first topic in the course flow.
              </div>
            )}

            {adjacentTopics.next ? (
              <Link href={`/our-courses/lesson/${encodeURIComponent(adjacentTopics.next.slug)}`} className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 hover:bg-white">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Next Topic</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">{adjacentTopics.next.title}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600">
                You are at the final topic in the course flow.
              </div>
            )}
          </div>
        </div>

        {topicRecord && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Current Chapter</p>
            <h4 className="mt-2 text-lg font-semibold text-zinc-900">{topicRecord.module}</h4>
            <p className="mt-2 text-sm text-zinc-600">Chapter {topicRecord.week} · {topicRecord.level}</p>
          </div>
        )}

        {relatedTopics.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Related Topics</p>
            <div className="mt-4 space-y-3">
              {relatedTopics.map((topic) => (
                <Link key={topic.slug} href={`/our-courses/lesson/${encodeURIComponent(topic.slug)}`} className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 hover:bg-white">
                  <p className="text-sm font-semibold text-zinc-900">{topic.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{topic.day} · Chapter {topic.week}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
