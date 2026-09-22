'use client';

import Link from 'next/link';
import { LuBookOpen, LuCircleCheck, LuHourglass, LuPlus, LuStar, LuUsers } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { TeacherCoursesTable } from '@/components/authoring/TeacherCoursesTable';
import { ButtonLink } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Display';
import { ErrorState, ProgressBar, Skeleton } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { teacherService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { formatPercent, formatRating } from '@/lib/format';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const dashboard = useAsync(() => teacherService.dashboard(), []);
  const data = dashboard.data;

  // Os cursos com mais alunos primeiro, para a tabela resumida.
  const topCourses = data ? [...data.courses].sort((a, b) => b.students_count - a.students_count).slice(0, 5) : [];

  return (
    <AppShell>
      <PageHeader
        title={`Olá, ${user?.name.split(' ')[0] ?? 'professor'}`}
        description="Acompanhe seus cursos, alunos e avaliações."
        actions={
          <ButtonLink href="/teacher/courses/new" leftIcon={<LuPlus aria-hidden="true" />}>
            Novo curso
          </ButtonLink>
        }
      />

      {dashboard.error ? (
        <ErrorState title="Não foi possível carregar o painel" onRetry={dashboard.reload} />
      ) : (
        <div className="flex flex-col gap-8">
          <section aria-label="Resumo" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {!data ? (
              Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              <>
                <StatCard label="Total de cursos" value={data.total_courses} icon={<LuBookOpen className="size-5" />} />
                <StatCard
                  label="Publicados"
                  value={data.published_courses}
                  hint={`${data.draft_courses} em rascunho`}
                  icon={<LuCircleCheck className="size-5" />}
                />
                <StatCard label="Em revisão" value={data.pending_courses} icon={<LuHourglass className="size-5" />} />
                <StatCard label="Alunos" value={data.total_students} icon={<LuUsers className="size-5" />} />
                <StatCard
                  label="Avaliação média"
                  value={data.rating_average > 0 ? formatRating(data.rating_average) : '—'}
                  icon={<LuStar className="size-5" />}
                  className="col-span-2 lg:col-span-1"
                />
              </>
            )}
          </section>

          {data && data.total_students > 0 && (
            <Card className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">Taxa média de conclusão</p>
                  <p className="text-sm text-ink-muted">Alunos que concluíram, sobre o total de matrículas ativas.</p>
                </div>
                <span className="text-2xl font-bold text-brand-500">{formatPercent(data.completion_rate)}</span>
              </div>
              <ProgressBar value={data.completion_rate} label="Taxa média de conclusão" />
            </Card>
          )}

          <section aria-labelledby="courses-title" className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <h2 id="courses-title" className="text-xl font-bold text-ink">
                Seus cursos
              </h2>
              <Link href="/teacher/courses" className="text-sm font-semibold text-brand-500 hover:underline">
                Ver todos
              </Link>
            </div>

            <TeacherCoursesTable courses={topCourses} loading={!data} onChanged={dashboard.reload} />
          </section>
        </div>
      )}
    </AppShell>
  );
}
