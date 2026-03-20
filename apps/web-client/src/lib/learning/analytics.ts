export type LearningAnalyticsEvent = {
  eventType: 'lesson_opened' | 'lesson_completed' | 'topic_opened' | 'keyboard_navigation_used' | 'resume_clicked';
  route: string;
  lessonSlug?: string;
  week?: number;
  day?: string;
  metadata?: Record<string, unknown>;
};

export async function trackLearningEvent(event: LearningAnalyticsEvent) {
  try {
    await fetch('/api/learning/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Analytics should never break the learner flow.
  }
}
