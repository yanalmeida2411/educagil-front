'use client';

import { createContext, useContext } from 'react';
import type { CourseDetail } from '@/types/api';

export interface CourseEditorValue {
  detail: CourseDetail;
  /** Recarrega curso e currículo depois de uma alteração. */
  reload: () => void;
}

export const CourseEditorContext = createContext<CourseEditorValue | null>(null);

export function useCourseEditor(): CourseEditorValue {
  const context = useContext(CourseEditorContext);
  if (!context) {
    throw new Error('useCourseEditor precisa estar dentro do layout do editor de curso.');
  }
  return context;
}
