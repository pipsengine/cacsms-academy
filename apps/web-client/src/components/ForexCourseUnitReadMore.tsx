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
  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedDay = useMemo<CurriculumDay>(() => {
    const dayValue = searchParams.get('day_of_week');
    const validDays: CurriculumDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return validDays.find((day) => day === dayValue) ?? 'Monday';
  }, [searchParams]);

  const topicRecord = useMemo(() => {
    const slug = searchParams.get('slug');
    if (slug) {
      const bySlug = getCurriculumTopicRecordBySlug(slug);
      if (bySlug) return bySlug;
    }

    const weekNumber = Number(searchParams.get('week_number') ?? 1);
    const safeWeek = Number.isFinite(weekNumber) ? weekNumber : 1;
    return getCurriculumTopicRecord(safeWeek, normalizedDay);
  }, [normalizedDay, searchParams]);

  const query = useMemo(() => {
    const topicTitle = topicRecord?.title ?? searchParams.get('topic_title') ?? 'Support and Resistance Fundamentals';
    const weekNumber = topicRecord?.week ?? Number(searchParams.get('week_number') ?? 1);
    const dayOfWeek = topicRecord?.day ?? normalizedDay;
    const topicType = topicRecord?.isAssignment ? 'assignment' : searchParams.get('topic_type') ?? 'lesson';

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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Course Topic</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100">{query.topic_title}</h2>
          {topicRecord?.summary && <p className="mt-3 text-sm leading-7 text-zinc-400">{topicRecord.summary}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">Week {query.week_number}</span>
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">{query.day_of_week}</span>
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">
              {query.topic_type === 'assignment' ? 'Assignment' : 'Lesson'}
            </span>
            {topicRecord?.level && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-zinc-300">{topicRecord.level}</span>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-300">
            Loading full lesson content...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-800 bg-red-950/30 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && unit && (
          <>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  {unit.difficulty_level}
                </span>
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {unit.is_assignment ? 'Assignment' : 'Lesson'}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-zinc-100">{unit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{unit.summary}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Lesson</h4>
              <div className="prose prose-invert prose-zinc mt-4 max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{unit.content}</ReactMarkdown>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Practical Example</h4>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{unit.example}</p>
            </div>

            {unit.is_assignment && unit.assignment && (
              <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Assignment Instructions</h4>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-100">{unit.assignment}</pre>
              </div>
            )}
          </>
        )}

        <div>
          <Link
            href="/our-courses"
            className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
          >
            Back to Our Courses
          </Link>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Topic Navigation</p>
          <div className="mt-4 space-y-3">
            {adjacentTopics.previous ? (
              <Link
                href={`/our-courses/topic?slug=${encodeURIComponent(adjacentTopics.previous.slug)}`}
                className="block rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 hover:border-zinc-700 hover:bg-zinc-900"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Previous Topic</p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">{adjacentTopics.previous.title}</p>
                <p className="mt-1 text-xs text-zinc-500">Week {adjacentTopics.previous.week} • {adjacentTopics.previous.day}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-500">
                You are at the first topic in the course flow.
              </div>
            )}

            {adjacentTopics.next ? (
              <Link
                href={`/our-courses/topic?slug=${encodeURIComponent(adjacentTopics.next.slug)}`}
                className="block rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 hover:border-zinc-700 hover:bg-zinc-900"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Next Topic</p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">{adjacentTopics.next.title}</p>
                <p className="mt-1 text-xs text-zinc-500">Week {adjacentTopics.next.week} • {adjacentTopics.next.day}</p>
              </Link>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-500">
                You are at the final topic in the course flow.
              </div>
            )}
          </div>
        </div>

        {topicRecord && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Current Module</p>
            <h4 className="mt-2 text-lg font-semibold text-zinc-100">{topicRecord.module}</h4>
            <p className="mt-2 text-sm text-zinc-400">Week {topicRecord.week} • {topicRecord.level}</p>
          </div>
        )}

        {relatedTopics.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Related Topics</p>
            <div className="mt-4 space-y-3">
              {relatedTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/our-courses/topic?slug=${encodeURIComponent(topic.slug)}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <p className="text-sm font-semibold text-zinc-100">{topic.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{topic.day} • Week {topic.week}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
