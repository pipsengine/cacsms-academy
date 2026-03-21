'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getChapterQuiz,
  type ChapterQuiz,
  type FillQuestion,
  type MCQQuestion,
  type QuizQuestion,
} from '@/lib/learning/chapterQuizRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'active' | 'results';

// MCQ answer: index 0–3 | Fill answer: trimmed string
type AnswerMap = Record<string, number | string>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFillCorrect(question: FillQuestion, userAnswer: string): boolean {
  const normalised = userAnswer.trim().toLowerCase();
  return question.acceptedAnswers.some((a) => a.toLowerCase() === normalised);
}

function scoreQuiz(quiz: ChapterQuiz, answers: AnswerMap): number {
  let score = 0;
  for (const q of quiz.questions) {
    if (q.type === 'mcq') {
      if (answers[q.id] === q.correctIndex) score += 1;
    } else {
      const raw = answers[q.id];
      if (typeof raw === 'string' && isFillCorrect(q, raw)) score += 1;
    }
  }
  return score;
}

function gradeLabel(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'Excellent', color: 'text-emerald-700' };
  if (pct >= 75) return { label: 'Good', color: 'text-amber-700' };
  if (pct >= 60) return { label: 'Passing', color: 'text-amber-600' };
  return { label: 'Needs Review', color: 'text-red-600' };
}

function questionLabel(idx: number, type: 'mcq' | 'fill'): string {
  return `Q${idx + 1} · ${type === 'mcq' ? 'Multiple Choice' : 'Fill in the Gap'}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MCQItem({
  question,
  index,
  selected,
  onChange,
  submitted,
}: {
  question: MCQQuestion;
  index: number;
  selected: number | undefined;
  onChange: (value: number) => void;
  submitted: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {questionLabel(index, 'mcq')}
      </p>
      <p className="text-sm font-semibold leading-relaxed text-zinc-900">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;

          let optClass =
            'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-relaxed transition-colors';

          if (!submitted) {
            optClass += isSelected
              ? ' border-emerald-400 bg-emerald-50 text-zinc-900'
              : ' border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50';
          } else if (isCorrect) {
            optClass += ' border-emerald-400 bg-emerald-50 text-emerald-900';
          } else if (isSelected && !isCorrect) {
            optClass += ' border-red-300 bg-red-50 text-red-800';
          } else {
            optClass += ' border-zinc-200 bg-white text-zinc-500';
          }

          return (
            <label key={i} className={optClass}>
              <input
                type="radio"
                name={question.id}
                value={i}
                checked={isSelected}
                onChange={() => !submitted && onChange(i)}
                className="mt-0.5 shrink-0 accent-emerald-600"
                disabled={submitted}
              />
              <span className="flex-1">
                <span className="mr-1.5 font-semibold text-zinc-500">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </span>
              {submitted && isCorrect && (
                <span className="ml-1 shrink-0 font-bold text-emerald-600">✓</span>
              )}
              {submitted && isSelected && !isCorrect && (
                <span className="ml-1 shrink-0 font-bold text-red-500">✗</span>
              )}
            </label>
          );
        })}
      </div>
      {submitted && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
          <span className="font-semibold text-zinc-800">Explanation: </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

function FillItem({
  question,
  index,
  value,
  onChange,
  submitted,
}: {
  question: FillQuestion;
  index: number;
  value: string;
  onChange: (v: string) => void;
  submitted: boolean;
}) {
  const isCorrect = submitted && isFillCorrect(question, value);
  const isWrong = submitted && !isCorrect;

  const parts = question.question.split('___');

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {questionLabel(index, 'fill')}
      </p>
      <p className="text-sm font-semibold leading-relaxed text-zinc-900">
        {parts[0]}
        <span
          className={`mx-1 inline-block min-w-[6rem] rounded border-b-2 px-2 align-middle ${
            submitted
              ? isCorrect
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-red-400 bg-red-50 text-red-800'
              : 'border-zinc-400 bg-zinc-100 text-zinc-800'
          }`}
        >
          {submitted ? value || '(blank)' : value}
        </span>
        {parts[1]}
      </p>
      {!submitted ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300"
        />
      ) : (
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <span className="mt-0.5 shrink-0 font-bold">{isCorrect ? '✓' : '✗'}</span>
          <div>
            {isWrong && (
              <p className="mb-1">
                <span className="font-semibold">Correct answer: </span>
                <span className="font-semibold text-emerald-700">{question.answer}</span>
              </p>
            )}
            <p className="leading-relaxed text-zinc-600 text-xs">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChapterQuizPage() {
  const params = useParams<{ week?: string }>();
  const week = Number(params?.week ?? '0');
  const quiz = useMemo(() => getChapterQuiz(week), [week]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const mcqQuestions = useMemo(
    () => quiz?.questions.filter((q): q is MCQQuestion => q.type === 'mcq') ?? [],
    [quiz]
  );
  const fillQuestions = useMemo(
    () => quiz?.questions.filter((q): q is FillQuestion => q.type === 'fill') ?? [],
    [quiz]
  );

  const score = useMemo(
    () => (quiz && submitted ? scoreQuiz(quiz, answers) : 0),
    [quiz, submitted, answers]
  );
  const total = quiz?.questions.length ?? 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = gradeLabel(pct);

  const answeredCount = useMemo(
    () =>
      quiz?.questions.filter((q) => {
        const a = answers[q.id];
        if (q.type === 'mcq') return typeof a === 'number';
        return typeof a === 'string' && a.trim().length > 0;
      }).length ?? 0,
    [quiz, answers]
  );

  const setAnswer = useCallback((id: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setPhase('results');
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setPhase('intro');
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  if (!quiz) {
    return (
      <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">Quiz not available</p>
        <p className="mt-2 text-sm text-red-600">
          No quiz has been created for Chapter {week} yet. Check back after completing all lessons.
        </p>
        <Link
          href="/our-courses"
          className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div ref={topRef} className="max-w-3xl space-y-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/our-courses" className="hover:text-zinc-700">Learning Home</Link>
        <span>/</span>
        <span className="text-zinc-600">Chapter {quiz.week} · {quiz.chapterTitle}</span>
        <span>/</span>
        <span className="text-zinc-800">Chapter Quiz</span>
      </nav>

      {/* ── Intro phase ──────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <span
              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                quiz.level === 'Beginner'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              {quiz.level}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-zinc-900">
              Chapter {quiz.week} Quiz · {quiz.chapterTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{quiz.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-zinc-900">20</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Multiple Choice</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-zinc-900">5</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Fill in the Gap</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-zinc-900">~{quiz.estimatedMinutes}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Est. Minutes</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              How This Quiz Works
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600">1.</span>
                Answer all 25 questions at your own pace — there is no time limit.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600">2.</span>
                Multiple choice: select the single best answer from the four options.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600">3.</span>
                Fill in the gap: type the missing word or phrase that best completes the statement.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600">4.</span>
                Click <strong>Submit Quiz</strong> when you have answered all questions. Correct answers, scores,
                and explanations are revealed immediately.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-600">5.</span>
                You may retake the quiz as many times as you like — there is no penalty for retaking.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setPhase('active')}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
          >
            Start Chapter Quiz →
          </button>
        </div>
      )}

      {/* ── Active / Results phase ────────────────────────────────────────── */}
      {(phase === 'active' || phase === 'results') && (
        <div className="space-y-6">
          {/* Score header (results only) */}
          {phase === 'results' && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Quiz Complete
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <div>
                  <p className={`text-5xl font-bold ${grade.color}`}>{pct}%</p>
                  <p className={`mt-1 text-sm font-semibold ${grade.color}`}>{grade.label}</p>
                </div>
                <div className="space-y-1 text-sm text-zinc-600">
                  <p>
                    <span className="font-semibold text-zinc-900">{score}</span> correct out of{' '}
                    <span className="font-semibold text-zinc-900">{total}</span> questions
                  </p>
                  <p>
                    MCQ: {quiz.questions.filter((q) => q.type === 'mcq' && answers[q.id] === (q as MCQQuestion).correctIndex).length}/{mcqQuestions.length}
                    {'  ·  '}
                    Fill: {quiz.questions.filter((q) => q.type === 'fill' && typeof answers[q.id] === 'string' && isFillCorrect(q as FillQuestion, answers[q.id] as string)).length}/{fillQuestions.length}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Progress indicator (active only) */}
          {phase === 'active' && (
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-3 shadow-sm">
              <p className="text-sm text-zinc-600">
                <span className="font-bold text-zinc-900">{answeredCount}</span> / {total} answered
              </p>
              <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.round((answeredCount / total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Section: Multiple Choice */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Part A — Multiple Choice{' '}
              <span className="normal-case font-normal text-zinc-400">(20 questions)</span>
            </h2>
            <div className="mt-5 divide-y divide-zinc-100">
              {mcqQuestions.map((q, idx) => (
                <div key={q.id} className="py-5 first:pt-0 last:pb-0">
                  <MCQItem
                    question={q}
                    index={idx}
                    selected={
                      typeof answers[q.id] === 'number' ? (answers[q.id] as number) : undefined
                    }
                    onChange={(v) => setAnswer(q.id, v)}
                    submitted={submitted}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Fill in the Gap */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Part B — Fill in the Gap{' '}
              <span className="normal-case font-normal text-zinc-400">(5 questions)</span>
            </h2>
            <div className="mt-5 divide-y divide-zinc-100">
              {fillQuestions.map((q, idx) => (
                <div key={q.id} className="py-5 first:pt-0 last:pb-0">
                  <FillItem
                    question={q}
                    index={mcqQuestions.length + idx}
                    value={typeof answers[q.id] === 'string' ? (answers[q.id] as string) : ''}
                    onChange={(v) => setAnswer(q.id, v)}
                    submitted={submitted}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {phase === 'active' && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">
                  {answeredCount < total
                    ? `${total - answeredCount} question${total - answeredCount !== 1 ? 's' : ''} unanswered — you can still submit.`
                    : 'All questions answered. Ready to submit!'}
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          )}

          {phase === 'results' && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Retake Quiz
              </button>
              <Link
                href="/our-courses"
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
              >
                Back to Courses
              </Link>
              <Link
                href={`/our-courses/day/${quiz.week}/Saturday`}
                className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Chapter {quiz.week} Overview
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
