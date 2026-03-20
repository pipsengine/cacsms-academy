'use client';

import { useEffect } from 'react';
import { trackLearningEvent } from '@/lib/learning/analytics';
import type { CurriculumDay } from '@/lib/learning/curriculum';

export default function LearningTopicOpenedTracker({ week, day }: { week: number; day: CurriculumDay }) {
  useEffect(() => {
    void trackLearningEvent({
      eventType: 'topic_opened',
      route: `/our-courses/day/${week}/${day.toLowerCase()}`,
      week,
      day,
    });
  }, [day, week]);

  return null;
}
