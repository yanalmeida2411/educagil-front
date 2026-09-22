'use client';

import Link from 'next/link';
import { LuAward, LuBookOpen, LuCircleCheck, LuClock, LuTrendingUp } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { ContinueCard } from '@/components/courses/ContinueCard';
import { CourseGrid } from '@/components/courses/CourseCard';
import { Card, StatCard } from '@/components/ui/Display';
import { ButtonLink } from '@/components/ui/Button';
import { CourseGridSkeleton, EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { learningService } from '@/services/learning';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { formatPercent, formatRelative } from '@/lib/format';

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  return `${hours.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const dashboard = useAsync(() => learningService.dashboard(), []);

  // Recomendações: populares que o aluno ainda não cursa. Pedimos alguns a
  // mais para sobrar o suficiente depois de filtrar os já matriculados.
  const recommendations = useAsync(
    async () => {
      const [popular, mine] = await Promise.all([
        courseService.list({ sort: 'popular', limit: 9 }),
        learningService.myCourses(undefined, 1, 100),
      ]);
      const enrolled = new Set(mine.items.map((enrollment) => enrollment.course_id));
      return popular.items.filter((course) => !enrolled.has(course.id)).slice(0, 3);
    },
    [],
  );

  const firstName = user?.name.split(' ')[0] ?? '';
  const data = dashboard.data;

  return (
    <AppShell>
      <PageHeader
        title={firstName ? `Olá, ${firstName}` : 'Seu painel'}
        description="Acompanhe seu progresso e continue de onde parou."
        actions={
          <ButtonLink href="/courses" variant="outline">
            Explorar cursos
          </ButtonLink>
        }
      />

      {dashboard.error ? (
        <ErrorState title="Não foi possível carregar seu painel" onRetry={dashboard.reload} />
      ) : (
        <div className="flex flex-col gap-10">
          <section aria-label="Resumo" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {dashboard.loading || !data ? (
              Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              <>
                <StatCard label="Matriculados" value={data.enrolled_courses} icon={<LuBookOpen className="size-5" />} />
                <StatCard label="Em andamento" value={data.in_progress} icon={<LuTrendingUp className="size-5" />} />
                <StatCard label="Concluídos" value={data.completed} icon={<LuCircleCheck className="size-5" />} />
                <StatCard label="Horas estudadas" value={formatHours(data.studied_hours)} icon={<LuClock className="size-5" />} />
                <StatCard
                  label="Certificados"
                  value={data.certificates}
                  icon={<LuAward className="size-5" />}
                  className="col-span-2 lg:col-span-1"
                />
              </>
            )}
          </section>

          {data && data.enrolled_courses > 0 && (
            <Card className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Progresso geral</span>
                <span className="text-sm font-semibold text-brand-500">{formatPercent(data.overall_progress)}</span>
              </div>
              <ProgressBar value={data.overall_progress} label="Progresso geral nos cursos" />
            </Card>
          )}

          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            <section aria-labelledby="continue-title" className="flex min-w-0 flex-col gap-4">
              <div className="flex items-end justify-between gap-3">
                <h2 id="continue-title" className="text-xl font-bold text-ink">
                  Continuar estudando
                </h2>
                <Link href="/my-courses" className="text-sm font-semibold text-brand-500 hover:underline">
                  Meus cursos
                </Link>
              </div>

              {dashboard.loading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : !data || data.continue_learning.length === 0 ? (
                <EmptyState
                  icon={<LuBookOpen className="size-10" />}
                  title={data && data.completed > 0 ? 'Tudo em dia por aqui' : 'Você ainda não começou nenhum curso'}
                  description={
                    data && data.completed > 0
                      ? 'Você concluiu todos os seus cursos. Que tal o próximo desafio?'
                      : 'Escolha um curso no catálogo e comece hoje mesmo.'
                  }
                  action={{ label: 'Encontrar um curso', href: '/courses' }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {data.continue_learning.map((enrollment) => (
                    <ContinueCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="activity-title" className="flex flex-col gap-4">
              <h2 id="activity-title" className="text-xl font-bold text-ink">
                Atividade recente
              </h2>

              {dashboard.loading ? (
                <Skeleton className="h-48 w-full" />
              ) : !data || data.recent_activity.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border-subtle p-5 text-sm text-ink-muted">
                  As aulas que você concluir aparecem aqui.
                </p>
              ) : (
                <ol className="flex flex-col rounded-xl border border-border-subtle">
                  {data.recent_activity.map((item) => (
                    <li key={`${item.lesson_id}-${item.completed_at}`} className="flex gap-3 border-b border-border-subtle p-4 last:border-b-0">
                      <LuCircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium text-ink">{item.lesson_title}</span>
                        <Link
                          href={`/learn/${item.course_slug}?lesson=${item.lesson_id}`}
                          className="truncate text-xs text-brand-500 hover:underline"
                        >
                          {item.course_title}
                        </Link>
                        <span className="text-xs text-ink-muted">{formatRelative(item.completed_at)}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {data && data.certificates > 0 && (
                <Link
                  href="/certificates"
                  className="flex items-center gap-3 rounded-xl border border-border-subtle p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <LuAward className="size-6 text-warning" aria-hidden="true" />
                  <span className="text-sm text-ink">
                    Você tem <strong>{data.certificates}</strong>{' '}
                    {data.certificates === 1 ? 'certificado' : 'certificados'}
                  </span>
                </Link>
              )}
            </section>
          </div>

          <section aria-labelledby="recommended-title" className="flex flex-col gap-4">
            <h2 id="recommended-title" className="text-xl font-bold text-ink">
              Recomendados para você
            </h2>
            {recommendations.loading ? (
              <CourseGridSkeleton count={3} />
            ) : recommendations.data && recommendations.data.length > 0 ? (
              <CourseGrid courses={recommendations.data} />
            ) : (
              <p className="text-sm text-ink-muted">
                Você já está matriculado nos cursos mais populares. Explore o catálogo completo para mais opções.
              </p>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
