import Link from 'next/link';
import LearningProgressChips from '@/components/LearningProgressChips';
import LearningTopicOpenedTracker from '@/components/LearningTopicOpenedTracker';
import { courseCurriculum, getDayLessons, getDayTopicSet, type CurriculumDay } from '@/lib/learning/curriculum';

type DayTopicPageProps = {
  params: Promise<{
    week: string;
    day: string;
  }>;
};

const DAYS: CurriculumDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function normalizeDay(raw: string): CurriculumDay | null {
  const value = raw.trim().toLowerCase();
  const day = DAYS.find((item) => item.toLowerCase() === value);
  return day ?? null;
}

function dayMotivation(day: CurriculumDay): string {
  switch (day) {
    case 'Monday':
      return 'Build your weekly foundation with clear context and disciplined preparation.';
    case 'Tuesday':
      return 'Reinforce your framework by validating structure and execution quality.';
    case 'Wednesday':
      return 'Mid-week is for precision. Focus on quality over quantity.';
    case 'Thursday':
      return 'Sharpen your process and prepare for high-impact market moments.';
    case 'Friday':
      return 'Close the week strong with selective, high-conviction setups.';
    case 'Saturday':
      return 'Reflect, review, and lock in one improvement that compounds next week.';
    default:
      return 'Stay consistent and keep learning one step at a time.';
  }
}

export default async function DayTopicPage({ params }: DayTopicPageProps) {
  const { week: weekStr, day: dayStr } = await params;
  const week = Number(weekStr);
  const day = normalizeDay(dayStr);

  if (!Number.isFinite(week) || !day) {
    return (
      <div className="max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">Day topic not found</p>
        <p className="mt-2 text-sm text-red-600">The requested chapter or topic is invalid.</p>
        <Link href="/our-courses" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to Courses
        </Link>
      </div>
    );
  }

  const chapter = courseCurriculum.find((item) => item.week === week);
  const topic = getDayTopicSet(week, day);
  const lessons = getDayLessons(week, day);

  if (!chapter || !topic || lessons.length === 0) {
    return (
      <div className="max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">Topic not available</p>
        <p className="mt-2 text-sm text-red-600">No learning content was found for this chapter/topic.</p>
        <Link href="/our-courses" className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <LearningTopicOpenedTracker week={week} day={day} />
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/our-courses" className="hover:text-zinc-700">Learning Home</Link>
        <span>/</span>
        <span className="text-zinc-600">Chapter {week}</span>
        <span>/</span>
        <span className="text-zinc-800">Topic {day}</span>
      </nav>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Topic Environment</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Chapter {week} · Topic {day} · {topic.dayTheme}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">Module: {chapter.module} · Level: {chapter.level}</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{dayMotivation(day)}</p>
        <LearningProgressChips week={week} day={day} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Learning Blueprint</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-700">
              <p><span className="font-semibold text-zinc-900">Chapter Focus:</span> Build conceptual depth with practical execution awareness.</p>
              <p><span className="font-semibold text-zinc-900">Topic Goal:</span> Master {topic.dayTheme} through progressive subtopic lessons.</p>
              <p><span className="font-semibold text-zinc-900">Subtopic Method:</span> Study one lesson at a time, then apply and review.</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Subtopics and Lessons</h2>
            <div className="mt-4 space-y-3">
              {lessons.map((lesson) => (
                <div key={lesson.slug} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>Subtopic {lesson.lessonNumber}</span>
                    <span>•</span>
                    <span>{lesson.type === 'assignment' ? 'Assignment Lesson' : 'Lesson'}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-zinc-900">{lesson.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600">{lesson.summary}</p>
                  <Link href={`/our-courses/lesson/${encodeURIComponent(lesson.slug)}`} className="mt-3 inline-flex text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                    Open Lesson
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Daily Learning Flow</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
              <li>Review topic objective and expected outcome.</li>
              <li>Study subtopics in order, then practice on charts.</li>
              <li>Capture one key insight and one improvement action.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Quick Access</p>
            <div className="mt-4 space-y-2">
              <Link href="/our-courses" className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 hover:bg-white">
                Back to Chapters
              </Link>
              <Link href={`/our-courses/lesson/${encodeURIComponent(lessons[0]!.slug)}`} className="block rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 hover:bg-white">
                Start Topic Lesson 1
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
