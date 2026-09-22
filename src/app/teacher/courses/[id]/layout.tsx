'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { LuEye, LuSend, LuUndo2 } from 'react-icons/lu';

import { AppShell } from '@/components/layout/AppShell';
import { CourseEditorContext } from '@/components/authoring/CourseEditorContext';
import { CourseStatusBadge } from '@/components/authoring/CourseStatusBadge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Alert, EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import type { CourseStatus } from '@/types/api';

export default function CourseEditorLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const toast = useToast();

  const detail = useAsync(() => courseService.detail(id), [id]);
  const [pendingStatus, setPendingStatus] = useState<CourseStatus | null>(null);
  const [saving, setSaving] = useState(false);

  const contextValue = useMemo(
    () => (detail.data ? { detail: detail.data, reload: detail.reload } : null),
    [detail.data, detail.reload],
  );

  const tabs = [
    { href: `/teacher/courses/${id}`, label: 'Informações' },
    { href: `/teacher/courses/${id}/content`, label: 'Conteúdo' },
    { href: `/teacher/courses/${id}/students`, label: 'Alunos' },
  ];

  async function changeStatus() {
    if (!pendingStatus) return;
    setSaving(true);
    try {
      const updated = await courseService.setStatus(id, pendingStatus);
      toast.success(
        updated.status === 'PENDING_REVIEW'
          ? 'Curso enviado para revisão. Você será notificado da decisão.'
          : updated.status === 'PUBLISHED'
            ? 'Curso publicado.'
            : 'Curso movido para rascunho.',
      );
      setPendingStatus(null);
      detail.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível alterar o status.');
    } finally {
      setSaving(false);
    }
  }

  if (detail.loading && !detail.data) {
    return (
      <AppShell>
        <Skeleton className="mb-3 h-8 w-1/2" />
        <Skeleton className="mb-8 h-10 w-80" />
        <Skeleton className="h-96 w-full" />
      </AppShell>
    );
  }

  if (!contextValue) {
    return (
      <AppShell>
        {detail.error?.isNotFound || detail.error?.isForbidden ? (
          <EmptyState
            title="Curso não encontrado"
            description="Ele pode ter sido excluído ou pertencer a outro professor."
            action={{ label: 'Meus cursos', href: '/teacher/courses' }}
          />
        ) : (
          <ErrorState title="Não foi possível carregar o curso" onRetry={detail.reload} />
        )}
      </AppShell>
    );
  }

  const { course } = contextValue.detail;

  return (
    <AppShell>
      <nav aria-label="Trilha" className="mb-3 text-sm text-ink-muted">
        <Link href="/teacher/courses" className="hover:text-brand-500 hover:underline">
          Meus cursos
        </Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-ink">{course.title}</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{course.title}</h1>
            <CourseStatusBadge status={course.status} />
          </div>
          <p className="text-sm text-ink-muted">Atualizado em {formatDate(course.updated_at)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/courses/${course.slug}`} variant="outline" leftIcon={<LuEye aria-hidden="true" />}>
            Visualizar
          </ButtonLink>
          {(course.status === 'DRAFT' || course.status === 'ARCHIVED') && (
            <Button leftIcon={<LuSend aria-hidden="true" />} onClick={() => setPendingStatus('PUBLISHED')}>
              Enviar para revisão
            </Button>
          )}
          {(course.status === 'PUBLISHED' || course.status === 'PENDING_REVIEW') && (
            <Button variant="outline" leftIcon={<LuUndo2 aria-hidden="true" />} onClick={() => setPendingStatus('DRAFT')}>
              {course.status === 'PUBLISHED' ? 'Despublicar' : 'Cancelar envio'}
            </Button>
          )}
        </div>
      </div>

      {course.status === 'DRAFT' && course.review_note && (
        <Alert tone="error" className="mb-6">
          <strong>O administrador pediu ajustes:</strong> {course.review_note}
        </Alert>
      )}
      {course.status === 'PENDING_REVIEW' && (
        <Alert tone="warning" className="mb-6">
          Curso em revisão desde {formatDate(course.submitted_at)}. Você ainda pode editar o conteúdo enquanto aguarda.
        </Alert>
      )}

      <nav aria-label="Seções do editor" className="mb-6 flex gap-1 overflow-x-auto border-b border-border-subtle">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                active ? 'border-brand-400 text-brand-500' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <CourseEditorContext.Provider value={contextValue}>{children}</CourseEditorContext.Provider>

      <ConfirmDialog
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        onConfirm={changeStatus}
        loading={saving}
        destructive={false}
        title={pendingStatus === 'PUBLISHED' ? 'Enviar para revisão?' : 'Voltar para rascunho?'}
        description={
          pendingStatus === 'PUBLISHED'
            ? 'Um administrador vai revisar o curso antes de colocá-lo no catálogo. O curso precisa ter ao menos uma aula obrigatória.'
            : 'O curso sai do catálogo e novas matrículas ficam bloqueadas. Alunos já matriculados mantêm o acesso.'
        }
        confirmLabel={pendingStatus === 'PUBLISHED' ? 'Enviar' : 'Voltar para rascunho'}
      />
    </AppShell>
  );
}
