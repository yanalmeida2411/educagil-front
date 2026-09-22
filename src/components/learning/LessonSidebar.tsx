'use client';

import { useState } from 'react';
import { LuChevronDown, LuCircleCheck } from 'react-icons/lu';

import { cn } from '@/lib/cn';
import { formatClock } from '@/lib/format';
import { LessonTypeIcon } from '@/components/courses/LessonTypeIcon';
import type { CourseModule } from '@/types/api';

interface LessonSidebarProps {
  modules: CourseModule[];
  currentLessonId: string | null;
  completed: Record<string, boolean>;
  onSelect: (lessonId: string) => void;
}

/** Lista de módulos e aulas do player, com o estado de conclusão de cada aula. */
export function LessonSidebar({ modules, currentLessonId, completed, onSelect }: LessonSidebarProps) {
  // Começa com todos abertos; o aluno recolhe o que quiser.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Conteúdo do curso" className="flex flex-col">
      {modules.map((module, index) => {
        const lessons = module.lessons ?? [];
        const done = lessons.filter((lesson) => completed[lesson.id]).length;
        const isCollapsed = collapsed[module.id] ?? false;
        const panelId = `module-${module.id}`;

        return (
          <div key={module.id} className="border-b border-border-subtle">
            <button
              type="button"
              aria-expanded={!isCollapsed}
              aria-controls={panelId}
              onClick={() => setCollapsed((current) => ({ ...current, [module.id]: !isCollapsed }))}
              className="flex w-full cursor-pointer items-start justify-between gap-2 bg-surface-muted/60 px-4 py-3 text-left hover:bg-surface-muted"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-ink">
                  {index + 1}. {module.title}
                </span>
                <span className="text-xs text-ink-muted">
                  {done}/{lessons.length} concluídas
                </span>
              </span>
              <LuChevronDown
                aria-hidden="true"
                className={cn('mt-0.5 size-4 shrink-0 text-ink-muted transition-transform', isCollapsed && '-rotate-90')}
              />
            </button>

            <ul id={panelId} hidden={isCollapsed}>
              {lessons.map((lesson) => {
                const active = lesson.id === currentLessonId;
                const isDone = completed[lesson.id] ?? false;

                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(lesson.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-3 border-l-4 px-4 py-2.5 text-left text-sm transition-colors',
                        active
                          ? 'border-brand-400 bg-brand-50'
                          : 'border-transparent hover:bg-surface-muted/60',
                      )}
                    >
                      {isDone ? (
                        <LuCircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Concluída" />
                      ) : (
                        <span
                          className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-border-subtle"
                          aria-label="Pendente"
                          role="img"
                        />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className={cn('text-ink', active && 'font-semibold')}>{lesson.title}</span>
                        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                          <LessonTypeIcon type={lesson.type} className="size-3" />
                          {lesson.duration_seconds > 0 && formatClock(lesson.duration_seconds)}
                          {!lesson.is_required && <span>· opcional</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
