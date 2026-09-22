import { cn } from '@/lib/cn';
import { LESSON_TYPE_LABELS } from '@/lib/format';
import type { LessonType } from '@/types/api';

const PATHS: Record<LessonType, string> = {
  VIDEO: 'M5 4.5v11l9-5.5-9-5.5Z',
  TEXT: 'M5 3.5h7l3 3v10H5v-13ZM7.5 9h5M7.5 12h5M7.5 6h2.5',
  PDF: 'M10 3v9m0 0-3.5-3.5M10 12l3.5-3.5M4 14.5v2h12v-2',
  QUIZ: 'M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.2M10 14.5v.01',
};

/** Ícone do tipo de aula, com rótulo acessível. */
export function LessonTypeIcon({ type, className }: { type: LessonType; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      role="img"
      aria-label={LESSON_TYPE_LABELS[type]}
      className={cn('size-4 shrink-0', className)}
    >
      <path
        d={PATHS[type]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={type === 'VIDEO' ? 'currentColor' : 'none'}
      />
    </svg>
  );
}
