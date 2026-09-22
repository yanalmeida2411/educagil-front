'use client';

import { useEffect, useState } from 'react';
import { LuArrowDown, LuArrowUp, LuClipboardCheck, LuFolderPlus, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

import { useCourseEditor } from '@/components/authoring/CourseEditorContext';
import { LessonFormModal } from '@/components/authoring/LessonFormModal';
import { ModuleFormModal } from '@/components/authoring/ModuleFormModal';
import { QuizEditorModal } from '@/components/authoring/QuizEditorModal';
import { LessonTypeIcon } from '@/components/courses/LessonTypeIcon';
import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Display';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { LESSON_TYPE_LABELS, formatClock, formatDuration } from '@/lib/format';
import type { CourseModule, Lesson } from '@/types/api';

type ModuleDialog = { mode: 'create' } | { mode: 'edit'; module: CourseModule } | null;
type LessonDialog = { mode: 'create'; moduleId: string } | { mode: 'edit'; lesson: Lesson } | null;
type PendingDelete = { kind: 'module'; module: CourseModule } | { kind: 'lesson'; lesson: Lesson } | null;

function swap<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[target]] = [copy[target]!, copy[index]!];
  return copy;
}

function MoveButtons({
  label,
  index,
  total,
  onMove,
}: {
  label: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <>
      <Button variant="ghost" size="sm" aria-label={`Mover ${label} para cima`} disabled={index === 0} onClick={() => onMove(-1)}>
        <LuArrowUp aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="sm" aria-label={`Mover ${label} para baixo`} disabled={index === total - 1} onClick={() => onMove(1)}>
        <LuArrowDown aria-hidden="true" />
      </Button>
    </>
  );
}

export default function CourseContentPage() {
  const toast = useToast();
  const { detail, reload: reloadCourse } = useCourseEditor();
  const courseId = detail.course.id;

  // O endpoint de módulos do editor devolve as aulas com o conteúdo completo.
  const remote = useAsync(() => courseService.modules(courseId), [courseId]);
  const [modules, setModules] = useState<CourseModule[]>([]);

  useEffect(() => {
    if (remote.data) setModules(remote.data);
  }, [remote.data]);

  const [moduleDialog, setModuleDialog] = useState<ModuleDialog>(null);
  const [lessonDialog, setLessonDialog] = useState<LessonDialog>(null);
  const [quizLesson, setQuizLesson] = useState<Lesson | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = () => {
    remote.reload();
    // O cabeçalho mostra contagens e a data de atualização do curso.
    reloadCourse();
  };

  const fail = (err: unknown, fallback: string) =>
    toast.error(err instanceof ApiError ? err.message : fallback);

  async function moveModule(index: number, direction: -1 | 1) {
    const reordered = swap(modules, index, direction);
    if (reordered === modules) return;

    setModules(reordered);
    try {
      await courseService.reorderModules(courseId, reordered.map((module) => module.id));
    } catch (err) {
      fail(err, 'Não foi possível reordenar os módulos.');
      remote.reload();
    }
  }

  async function moveLesson(module: CourseModule, index: number, direction: -1 | 1) {
    const lessons = module.lessons ?? [];
    const reordered = swap(lessons, index, direction);
    if (reordered === lessons) return;

    setModules((current) => current.map((item) => (item.id === module.id ? { ...item, lessons: reordered } : item)));
    try {
      await courseService.reorderLessons(module.id, reordered.map((lesson) => lesson.id));
    } catch (err) {
      fail(err, 'Não foi possível reordenar as aulas.');
      remote.reload();
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === 'module') {
        await courseService.removeModule(pendingDelete.module.id);
        toast.success('Módulo excluído.');
      } else {
        await courseService.removeLesson(pendingDelete.lesson.id);
        toast.success('Aula excluída.');
      }
      setPendingDelete(null);
      refresh();
    } catch (err) {
      fail(err, 'Não foi possível excluir.');
    } finally {
      setDeleting(false);
    }
  }

  if (remote.loading && modules.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (remote.error) {
    return <ErrorState title="Não foi possível carregar o conteúdo" onRetry={remote.reload} />;
  }

  const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0);
  const totalDuration = modules.reduce(
    (sum, module) => sum + (module.lessons ?? []).reduce((acc, lesson) => acc + lesson.duration_seconds, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} · {totalLessons} aulas · {formatDuration(totalDuration)}
        </p>
        <Button leftIcon={<LuFolderPlus aria-hidden="true" />} onClick={() => setModuleDialog({ mode: 'create' })}>
          Novo módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          icon={<LuFolderPlus className="size-10" />}
          title="Monte a estrutura do curso"
          description="Crie o primeiro módulo e adicione aulas de vídeo, texto, material ou quiz."
          action={{ label: 'Criar primeiro módulo', onClick: () => setModuleDialog({ mode: 'create' }) }}
        />
      ) : (
        <ol className="flex flex-col gap-4">
          {modules.map((module, moduleIndex) => {
            const lessons = module.lessons ?? [];

            return (
              <li key={module.id}>
                <Card className="overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-muted/60 px-4 py-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-ink">
                        {moduleIndex + 1}. {module.title}
                      </h2>
                      {module.description && <p className="text-sm text-ink-muted">{module.description}</p>}
                    </div>
                    <div className="flex items-center">
                      <MoveButtons label={`módulo ${module.title}`} index={moduleIndex} total={modules.length} onMove={(d) => moveModule(moduleIndex, d)} />
                      <Button variant="ghost" size="sm" aria-label={`Editar módulo ${module.title}`} onClick={() => setModuleDialog({ mode: 'edit', module })}>
                        <LuPencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" aria-label={`Excluir módulo ${module.title}`} onClick={() => setPendingDelete({ kind: 'module', module })}>
                        <LuTrash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {lessons.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-ink-muted">Nenhuma aula neste módulo ainda.</p>
                  ) : (
                    <ol className="divide-y divide-border-subtle">
                      {lessons.map((lesson, lessonIndex) => (
                        <li key={lesson.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                          <LessonTypeIcon type={lesson.type} className="text-ink-muted" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="text-sm font-medium text-ink">{lesson.title}</span>
                            <span className="flex flex-wrap gap-2 text-xs text-ink-muted">
                              {LESSON_TYPE_LABELS[lesson.type]}
                              {lesson.duration_seconds > 0 && <span>· {formatClock(lesson.duration_seconds)}</span>}
                              {!lesson.is_required && <Badge>Opcional</Badge>}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {lesson.type === 'QUIZ' && (
                              <Button variant="secondary" size="sm" leftIcon={<LuClipboardCheck aria-hidden="true" />} onClick={() => setQuizLesson(lesson)}>
                                Editar quiz
                              </Button>
                            )}
                            <MoveButtons label={`aula ${lesson.title}`} index={lessonIndex} total={lessons.length} onMove={(d) => moveLesson(module, lessonIndex, d)} />
                            <Button variant="ghost" size="sm" aria-label={`Editar aula ${lesson.title}`} onClick={() => setLessonDialog({ mode: 'edit', lesson })}>
                              <LuPencil aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="sm" aria-label={`Excluir aula ${lesson.title}`} onClick={() => setPendingDelete({ kind: 'lesson', lesson })}>
                              <LuTrash2 aria-hidden="true" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="border-t border-border-subtle px-4 py-2">
                    <Button variant="ghost" size="sm" leftIcon={<LuPlus aria-hidden="true" />} onClick={() => setLessonDialog({ mode: 'create', moduleId: module.id })}>
                      Adicionar aula
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      {/* key força o reset do formulário a cada abertura. */}
      {moduleDialog && (
        <ModuleFormModal
          key={moduleDialog.mode === 'edit' ? moduleDialog.module.id : 'new'}
          open
          module={moduleDialog.mode === 'edit' ? moduleDialog.module : null}
          onClose={() => setModuleDialog(null)}
          onSubmit={async (payload) => {
            if (moduleDialog.mode === 'edit') {
              await courseService.updateModule(moduleDialog.module.id, payload);
              toast.success('Módulo atualizado.');
            } else {
              await courseService.createModule(courseId, payload);
              toast.success('Módulo criado.');
            }
            refresh();
          }}
        />
      )}

      {lessonDialog && (
        <LessonFormModal
          key={lessonDialog.mode === 'edit' ? lessonDialog.lesson.id : `new-${lessonDialog.moduleId}`}
          open
          lesson={lessonDialog.mode === 'edit' ? lessonDialog.lesson : null}
          onClose={() => setLessonDialog(null)}
          onSubmit={async (payload) => {
            if (lessonDialog.mode === 'edit') {
              await courseService.updateLesson(lessonDialog.lesson.id, payload);
              toast.success('Aula atualizada.');
            } else {
              const created = await courseService.createLesson(lessonDialog.moduleId, payload);
              toast.success(created.type === 'QUIZ' ? 'Aula criada. Agora cadastre as questões do quiz.' : 'Aula criada.');
              if (created.type === 'QUIZ') setQuizLesson(created);
            }
            refresh();
          }}
        />
      )}

      <QuizEditorModal lesson={quizLesson} onClose={() => setQuizLesson(null)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={pendingDelete?.kind === 'module' ? 'Excluir módulo?' : 'Excluir aula?'}
        description={
          pendingDelete?.kind === 'module'
            ? `"${pendingDelete.module.title}" e todas as ${pendingDelete.module.lessons?.length ?? 0} aulas dele serão excluídos, incluindo o progresso dos alunos nessas aulas.`
            : `"${pendingDelete?.kind === 'lesson' ? pendingDelete.lesson.title : ''}" será excluída, junto com comentários e o progresso dos alunos nela.`
        }
        confirmLabel="Excluir"
      />
    </div>
  );
}
