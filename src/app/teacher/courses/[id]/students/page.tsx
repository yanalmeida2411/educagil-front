'use client';

import { useState } from 'react';

import { useCourseEditor } from '@/components/authoring/CourseEditorContext';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Avatar, Badge } from '@/components/ui/Display';
import { ErrorState, ProgressBar } from '@/components/ui/Feedback';
import Pagination from '@/components/ui/Pagination';
import { teacherService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { formatDate, formatPercent, formatRelative, STATUS_LABELS } from '@/lib/format';
import type { Enrollment } from '@/types/api';

export default function CourseStudentsPage() {
  const { detail } = useCourseEditor();
  const courseId = detail.course.id;
  const [page, setPage] = useState(1);

  const students = useAsync(() => teacherService.students(courseId, page, 20), [courseId, page]);

  const columns: Array<Column<Enrollment>> = [
    {
      key: 'student',
      header: 'Aluno',
      render: (enrollment) => {
        const name = enrollment.student?.name ?? 'Aluno removido';
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={name} src={enrollment.student?.avatar_url} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-ink">{name}</span>
              {enrollment.student?.email && (
                <span className="truncate text-xs text-ink-muted">{enrollment.student.email}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'Progresso',
      className: 'w-48',
      render: (enrollment) => (
        <div className="flex items-center gap-2">
          <ProgressBar
            value={enrollment.progress_percentage}
            size="sm"
            label={`Progresso de ${enrollment.student?.name ?? 'aluno'}`}
          />
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-ink-muted">
            {formatPercent(enrollment.progress_percentage)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (enrollment) =>
        enrollment.status === 'COMPLETED' ? (
          <Badge tone="success">{STATUS_LABELS.COMPLETED}</Badge>
        ) : (
          <Badge tone="brand">{STATUS_LABELS.ACTIVE}</Badge>
        ),
    },
    {
      key: 'enrolled',
      header: 'Matrícula',
      hideOnMobile: true,
      render: (enrollment) => <span className="text-ink-muted">{formatDate(enrollment.enrolled_at)}</span>,
    },
    {
      key: 'activity',
      header: 'Última atividade',
      hideOnMobile: true,
      render: (enrollment) => (
        <span className="text-ink-muted">
          {enrollment.status === 'COMPLETED'
            ? `Concluiu em ${formatDate(enrollment.completed_at)}`
            : formatRelative(enrollment.updated_at)}
        </span>
      ),
    },
  ];

  const total = students.data?.meta.total;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        {total === undefined
          ? 'Carregando alunos…'
          : total === 1
            ? '1 aluno matriculado'
            : `${total} alunos matriculados`}
        {' '}— matrículas canceladas não aparecem nesta lista.
      </p>

      {students.error ? (
        <ErrorState title="Não foi possível carregar os alunos" onRetry={students.reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={students.data?.items ?? []}
            rowKey={(enrollment) => enrollment.id}
            loading={students.loading && !students.data}
            caption={`Alunos matriculados em ${detail.course.title}`}
            emptyTitle="Nenhum aluno matriculado ainda"
            emptyDescription={
              detail.course.status === 'PUBLISHED'
                ? 'Assim que alguém se matricular, você acompanha o progresso por aqui.'
                : 'O curso precisa estar publicado no catálogo para receber matrículas.'
            }
          />
          {students.data && (
            <Pagination
              page={students.data.meta.page}
              totalPages={students.data.meta.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
