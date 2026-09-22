'use client';

import Link from 'next/link';

import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Stars } from '@/components/ui/Display';
import { formatDate, formatRating } from '@/lib/format';
import type { Course } from '@/types/api';
import { CourseActionsMenu } from './CourseActionsMenu';
import { CourseStatusBadge } from './CourseStatusBadge';

export function TeacherCoursesTable({
  courses,
  loading,
  onChanged,
  emptyAction = true,
}: {
  courses: Course[];
  loading?: boolean;
  onChanged: () => void;
  emptyAction?: boolean;
}) {
  const columns: Array<Column<Course>> = [
    {
      key: 'course',
      header: 'Curso',
      render: (course) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-brand-600 sm:block">
            {course.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnail externa cadastrada pelo professor
              <img src={course.thumbnail_url} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <Link href={`/teacher/courses/${course.id}`} className="truncate font-semibold text-ink hover:text-brand-500">
              {course.title}
            </Link>
            <span className="text-xs text-ink-muted">
              {course.category?.name ?? 'Sem categoria'} · {course.lessons_count} aulas
            </span>
            {course.status === 'DRAFT' && course.review_note && (
              <span className="text-xs font-medium text-danger">Reprovado: veja o motivo no editor</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (course) => <CourseStatusBadge status={course.status} />,
    },
    {
      key: 'students',
      header: 'Alunos',
      align: 'right',
      render: (course) => <span className="tabular-nums">{course.students_count}</span>,
    },
    {
      key: 'rating',
      header: 'Avaliação',
      hideOnMobile: true,
      render: (course) =>
        course.rating_count > 0 ? (
          <span className="flex items-center gap-1.5">
            <Stars value={course.rating_average} size="sm" />
            <span className="text-xs text-ink-muted">
              {formatRating(course.rating_average)} ({course.rating_count})
            </span>
          </span>
        ) : (
          <span className="text-xs text-ink-muted">—</span>
        ),
    },
    {
      key: 'updated',
      header: 'Atualizado',
      hideOnMobile: true,
      render: (course) => <span className="text-ink-muted">{formatDate(course.updated_at)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      render: (course) => <CourseActionsMenu course={course} onChanged={onChanged} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={courses}
      rowKey={(course) => course.id}
      loading={loading}
      caption="Seus cursos"
      emptyTitle="Nenhum curso por aqui"
      emptyDescription="Crie seu primeiro curso e organize módulos, aulas e quizzes."
      emptyAction={emptyAction ? { label: 'Criar curso', href: '/teacher/courses/new' } : undefined}
    />
  );
}
