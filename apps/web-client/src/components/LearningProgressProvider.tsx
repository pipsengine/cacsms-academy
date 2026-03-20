'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import type { LessonRecord } from '@/lib/learning/curriculum';

export type LearningProgressEntry = {
  lessonSlug: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
};

export type LearningProgressData = {
  enrolled: boolean;
  currentLessonIndex: number;
  currentLesson: LessonRecord | null;
  completedCount: number;
  totalLessons: number;
  enrolledAt?: string;
  lastAccessAt?: string;
  progress: LearningProgressEntry[];
};

export type LearningProgressContextValue = {
  progressData: LearningProgressData | null;
  progressMap: Map<string, string>;
  momentum: { streakDays: number; lastActivityLabel: string };
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export const LearningProgressContext = createContext<LearningProgressContextValue | undefined>(undefined);

function toIsoDay(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function LearningProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<LearningProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProgressData(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/learning/progress');
      if (!res.ok) return;
      const payload = (await res.json()) as LearningProgressData;
      setProgressData(payload);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const progressMap = useMemo(() => {
    const map = new Map<string, string>();
    progressData?.progress.forEach((entry) => map.set(entry.lessonSlug, entry.status));
    return map;
  }, [progressData]);

  const momentum = useMemo(() => {
    if (!progressData?.enrolled) {
      return { streakDays: 0, lastActivityLabel: 'Not started yet' };
    }

    const completedDates = (progressData.progress ?? [])
      .map((entry) => entry.completedAt)
      .filter(Boolean)
      .map((value) => new Date(value as string))
      .filter((value) => !Number.isNaN(value.getTime()))
      .map((value) => toIsoDay(value));

    const uniqueDates = [...new Set(completedDates)].sort((a, b) => (a < b ? 1 : -1));

    let streakDays = 0;
    if (uniqueDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const latest = new Date(`${uniqueDates[0]}T00:00:00`);
      const dayDiff = Math.floor((today.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff <= 1) {
        let cursor = new Date(latest);
        for (const dateStr of uniqueDates) {
          const date = new Date(`${dateStr}T00:00:00`);
          if (date.getTime() === cursor.getTime()) {
            streakDays += 1;
            cursor = new Date(cursor.getTime() - 1000 * 60 * 60 * 24);
          }
        }
      }
    }

    const activitySource = progressData.lastAccessAt ?? progressData.enrolledAt;
    const lastActivityLabel = activitySource
      ? new Date(activitySource).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No activity yet';

    return { streakDays, lastActivityLabel };
  }, [progressData]);

  const value = useMemo(
    () => ({ progressData, progressMap, momentum, isLoading, refresh }),
    [progressData, progressMap, momentum, isLoading, refresh]
  );

  return <LearningProgressContext.Provider value={value}>{children}</LearningProgressContext.Provider>;
}
