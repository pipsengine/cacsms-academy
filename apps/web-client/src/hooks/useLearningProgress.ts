'use client';

import { useContext } from 'react';
import { LearningProgressContext } from '@/components/LearningProgressProvider';

export function useLearningProgress() {
  const context = useContext(LearningProgressContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within LearningProgressProvider');
  }

  return context;
}
