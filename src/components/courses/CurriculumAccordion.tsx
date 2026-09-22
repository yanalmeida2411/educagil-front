import { Accordion } from '@/components/ui/Display';
import { formatClock, formatDuration } from '@/lib/format';
import type { CourseModule } from '@/types/api';
import { LessonTypeIcon } from './LessonTypeIcon';

/** Grade do curso na página pública: módulos, aulas, tipo e duração. */
export function CurriculumAccordion({ modules }: { modules: CourseModule[] }) {
  if (modules.length === 0) {
    return <p className="text-sm text-ink-muted">O conteúdo deste curso ainda está sendo preparado.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      {modules.map((module, index) => {
        const lessons = module.lessons ?? [];
        const duration = lessons.reduce((total, lesson) => total + lesson.duration_seconds, 0);

        return (
          <Accordion
            key={module.id}
            defaultOpen={index === 0}
            title={`${index + 1}. ${module.title}`}
            subtitle={`${lessons.length} ${lessons.length === 1 ? 'aula' : 'aulas'}${
              duration > 0 ? ` · ${formatDuration(duration)}` : ''
            }`}
          >
            <ul className="divide-y divide-border-subtle bg-surface-muted/30">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <LessonTypeIcon type={lesson.type} className="text-ink-muted" />
                  <span className="flex-1 text-ink">{lesson.title}</span>
                  {!lesson.is_required && (
                    <span className="text-xs text-ink-subtle">opcional</span>
                  )}
                  {lesson.duration_seconds > 0 && (
                    <span className="tabular-nums text-xs text-ink-muted">
                      {formatClock(lesson.duration_seconds)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Accordion>
        );
      })}
    </div>
  );
}
