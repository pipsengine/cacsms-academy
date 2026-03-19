'use client';

import { useEffect, useMemo, useState } from 'react';
import { forexCourseCurriculum, getCurriculumTopic, getCurriculumTopicRecord, type CurriculumDay } from '@/lib/learning/curriculum';
import Link from 'next/link';

type DayOfWeek = CurriculumDay;
type TopicType = 'lesson' | 'assignment';

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

const dayOptions: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ForexCourseUnitGenerator() {
  const [weekNumber, setWeekNumber] = useState(forexCourseCurriculum[0]?.week ?? 1);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicType, setTopicType] = useState<TopicType>('lesson');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<CourseUnit | null>(null);

  const selectedWeek = useMemo(
    () => forexCourseCurriculum.find((item) => item.week === weekNumber) ?? forexCourseCurriculum[0],
    [weekNumber]
  );

  useEffect(() => {
    const topic = getCurriculumTopic(weekNumber, dayOfWeek);
    if (topic) {
      setTopicTitle(topic);
    }
  }, [weekNumber, dayOfWeek]);

  const effectiveTopicType = useMemo<TopicType>(() => {
    if (dayOfWeek === 'Saturday') return 'assignment';
    return topicType;
  }, [dayOfWeek, topicType]);

  const selectedTopicRecord = useMemo(
    () => getCurriculumTopicRecord(weekNumber, dayOfWeek),
    [weekNumber, dayOfWeek]
  );

  async function generateUnit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/learning/unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_title: topicTitle,
          week_number: weekNumber,
          day_of_week: dayOfWeek,
          topic_type: effectiveTopicType,
        }),
      });

      if (!res.ok) throw new Error(`Generation failed with status ${res.status}`);
      const data = (await res.json()) as CourseUnit;
      setUnit(data);
    } catch {
      setError('Unable to generate lesson right now. Please try again.');
      setUnit(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-lg font-semibold text-zinc-100">Generate Learning Unit</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Create one structured forex lesson or Saturday assignment from your curriculum topic.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Topic Title</span>
            <input
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
              placeholder="e.g., Support and Resistance Fundamentals"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Week Number</span>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(Number(e.target.value || 1))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
            >
              {forexCourseCurriculum.map((week) => (
                <option key={week.week} value={week.week}>{`Week ${week.week} · ${week.module}`}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Day of Week</span>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500"
            >
              {dayOptions.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Topic Type</span>
            <select
              value={effectiveTopicType}
              onChange={(e) => setTopicType(e.target.value as TopicType)}
              disabled={dayOfWeek === 'Saturday'}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500 disabled:opacity-60"
            >
              <option value="lesson">Lesson</option>
              <option value="assignment">Assignment</option>
            </select>
            {dayOfWeek === 'Saturday' && (
              <p className="mt-1.5 text-xs text-amber-400">Saturday is automatically treated as assignment.</p>
            )}
          </label>
        </div>

        {selectedWeek && (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <p className="text-xs text-zinc-500">
              Selected Topic: <span className="font-semibold text-zinc-200">{selectedWeek.topics[dayOfWeek]}</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => void generateUnit()}
          disabled={loading || !topicTitle.trim()}
          className="mt-5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Unit'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {unit && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                {unit.difficulty_level}
              </span>
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                {unit.is_assignment ? 'Assignment' : 'Lesson'}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-zinc-100">{unit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{unit.summary}</p>
            <div className="mt-4">
              <Link
                href={`/our-courses/topic?slug=${encodeURIComponent(selectedTopicRecord?.slug ?? '')}&topic_title=${encodeURIComponent(topicTitle)}&week_number=${weekNumber}&day_of_week=${encodeURIComponent(dayOfWeek)}&topic_type=${encodeURIComponent(effectiveTopicType)}`}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Read More
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Sections</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {unit.sections.map((section) => (
                <span key={section} className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200">
                  {section}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Detailed Lesson</h4>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {unit.content}
            </pre>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Example</h4>
            <p className="mt-3 text-sm leading-relaxed text-zinc-200">{unit.example}</p>
          </div>

          {unit.is_assignment && (
            <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Assignment</h4>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed text-amber-100">
                {unit.assignment}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
