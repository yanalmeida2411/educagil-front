'use client';

import Link from 'next/link';
import {
  LuAward,
  LuBookOpen,
  LuCircleCheck,
  LuGraduationCap,
  LuHourglass,
  LuUsers,
} from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { CourseStatusBadge } from '@/components/authoring/CourseStatusBadge';
import { ButtonLink } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/Display';
import { ErrorState, Skeleton } from '@/components/ui/Feedback';
import { adminService } from '@/services/admin';
import { useAsync } from '@/lib/useAsync';
import { formatDate, formatPercent } from '@/lib/format';
import type { Course } from '@/types/api';

export default function AdminDashboardPage() {
  const dashboard = useAsync(() => adminService.dashboard(), []);
  const pending = useAsync(() => adminService.courses({ status: 'PENDING_REVIEW', limit: 5 }), []);
  const data = dashboard.data;

  const completionRate =
    data && data.total_enrollments > 0 ? (data.completed_courses / data.total_enrollments) * 100 : 0;

  const pendingColumns: Array<Column<Course>> = [
    {
      key: 'course',
      header: 'Curso',
      render: (course) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-ink">{course.title}</span>
          <span className="text-xs text-ink-muted">{course.teacher?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      hideOnMobile: true,
      render: (course) => <CourseStatusBadge status={course.status} />,
    },
    {
      key: 'submitted',
      header: 'Enviado em',
      hideOnMobile: true,
      render: (course) => <span className="text-ink-muted">{formatDate(course.submitted_at)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      render: () => (
        <Link href="/admin/courses?status=PENDING_REVIEW" className="text-sm font-semibold text-brand-500 hover:underline">
          Revisar
        </Link>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader title="Painel administrativo" description="Visão geral de usuários, cursos e aprendizagem na plataforma." />

      {dashboard.error ? (
        <ErrorState title="Não foi possível carregar o painel" onRetry={dashboard.reload} />
      ) : (
        <div className="flex flex-col gap-8">
          <section aria-label="Resumo" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {!data ? (
              Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              <>
                <StatCard
                  label="Usuários"
                  value={data.total_users}
                  hint={`${data.total_students} alunos · ${data.total_teachers} professores · ${data.total_admins} admins`}
                  icon={<LuUsers className="size-5" />}
                />
                <StatCard
                  label="Cursos"
                  value={data.total_courses}
                  hint={`${data.draft_courses} em rascunho · ${data.archived_courses} arquivados`}
                  icon={<LuBookOpen className="size-5" />}
                />
                <StatCard label="Publicados" value={data.published_courses} icon={<LuCircleCheck className="size-5" />} />
                <StatCard label="Aguardando revisão" value={data.pending_courses} icon={<LuHourglass className="size-5" />} />
                <StatCard
                  label="Matrículas"
                  value={data.total_enrollments}
                  hint={`${formatPercent(completionRate)} concluídas`}
                  icon={<LuGraduationCap className="size-5" />}
                />
                <StatCard label="Certificados emitidos" value={data.total_certificates} icon={<LuAward className="size-5" />} />
              </>
            )}
          </section>

          <section aria-labelledby="pending-title" className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <h2 id="pending-title" className="text-xl font-bold text-ink">
                Cursos aguardando revisão
              </h2>
              <ButtonLink href="/admin/courses?status=PENDING_REVIEW" variant="outline" size="sm">
                Ver todos
              </ButtonLink>
            </div>

            {pending.error ? (
              <ErrorState title="Não foi possível carregar a fila de revisão" onRetry={pending.reload} />
            ) : (
              <DataTable
                columns={pendingColumns}
                rows={pending.data?.items ?? []}
                rowKey={(course) => course.id}
                loading={pending.loading && !pending.data}
                caption="Cursos aguardando revisão"
                emptyTitle="Fila de revisão vazia"
                emptyDescription="Quando um professor enviar um curso para publicação, ele aparece aqui."
              />
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
