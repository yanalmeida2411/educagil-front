'use client';

import { useParams } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import { CourseGrid } from '@/components/courses/CourseCard';
import { Avatar, Badge, StatCard } from '@/components/ui/Display';
import { CourseGridSkeleton, EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { formatCompact, formatRating } from '@/lib/format';

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const profile = useAsync(() => courseService.teacherProfile(id), [id]);

  if (profile.loading) {
    return (
      <AppShell>
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <div className="mt-10">
          <CourseGridSkeleton count={3} />
        </div>
      </AppShell>
    );
  }

  if (profile.error || !profile.data) {
    return (
      <AppShell>
        {profile.error?.isNotFound ? (
          <EmptyState
            title="Professor não encontrado"
            action={{ label: 'Explorar cursos', href: '/courses' }}
          />
        ) : (
          <ErrorState title="Não foi possível carregar o perfil" onRetry={profile.reload} />
        )}
      </AppShell>
    );
  }

  const { teacher, courses, students_count, rating_average, courses_count } = profile.data;

  return (
    <AppShell>
      <section className="flex flex-col gap-6 border-b border-border-subtle pb-8 sm:flex-row sm:items-start">
        <Avatar name={teacher.name} src={teacher.avatar_url} size="xl" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Professor</p>
          <h1 className="text-3xl font-bold text-ink">{teacher.name}</h1>
          {teacher.headline && <p className="text-lg text-ink-muted">{teacher.headline}</p>}

          {teacher.specialties && teacher.specialties.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1" aria-label="Especialidades">
              {teacher.specialties.map((specialty) => (
                <li key={specialty}>
                  <Badge tone="brand">{specialty}</Badge>
                </li>
              ))}
            </ul>
          )}

          {teacher.bio && (
            <p className="mt-2 max-w-3xl whitespace-pre-line leading-relaxed text-ink">{teacher.bio}</p>
          )}
        </div>
      </section>

      <section aria-label="Números do professor" className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-3">
        <StatCard label="Cursos publicados" value={courses_count} />
        <StatCard label="Alunos" value={formatCompact(students_count)} />
        <StatCard
          label="Avaliação média"
          value={rating_average > 0 ? formatRating(rating_average) : '—'}
          hint={rating_average > 0 ? 'de 5 estrelas' : 'Ainda sem avaliações'}
        />
      </section>

      <section aria-labelledby="teacher-courses-title">
        <h2 id="teacher-courses-title" className="mb-5 text-xl font-bold text-ink">
          Cursos de {teacher.name.split(' ')[0]}
        </h2>

        {courses.length === 0 ? (
          <EmptyState
            title="Nenhum curso publicado ainda"
            description="Os cursos aparecem aqui assim que forem aprovados."
          />
        ) : (
          <CourseGrid courses={courses} />
        )}
      </section>
    </AppShell>
  );
}
