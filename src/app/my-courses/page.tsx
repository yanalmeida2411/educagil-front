'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuBookOpen, LuHeart } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { CourseGrid } from '@/components/courses/CourseCard';
import { Tabs } from '@/components/ui/Display';
import { ButtonLink } from '@/components/ui/Button';
import { CourseGridSkeleton, EmptyState, ErrorState } from '@/components/ui/Feedback';
import Pagination from '@/components/ui/Pagination';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import type { Course, EnrollmentStatus, PaginationMeta } from '@/types/api';

type Filter = 'all' | 'active' | 'completed' | 'favorites';

const TABS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Em andamento' },
  { id: 'completed', label: 'Concluídos' },
  { id: 'favorites', label: 'Favoritos' },
];

const STATUS_BY_FILTER: Record<Exclude<Filter, 'favorites'>, EnrollmentStatus | undefined> = {
  all: undefined,
  active: 'ACTIVE',
  completed: 'COMPLETED',
};

const EMPTY_COPY: Record<Filter, { title: string; description: string }> = {
  all: {
    title: 'Você ainda não está matriculado em nenhum curso',
    description: 'Explore o catálogo e comece a estudar hoje mesmo.',
  },
  active: {
    title: 'Nenhum curso em andamento',
    description: 'Os cursos que você começar aparecem aqui até serem concluídos.',
  },
  completed: {
    title: 'Nenhum curso concluído ainda',
    description: 'Conclua todas as aulas obrigatórias de um curso para ganhar seu certificado.',
  },
  favorites: {
    title: 'Nenhum favorito',
    description: 'Toque em "Favoritar" na página de um curso para guardá-lo para depois.',
  },
};

interface Listing {
  courses: Course[];
  progress: Record<string, number>;
  meta: PaginationMeta;
}

function MyCoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawFilter = searchParams.get('filter');
  const filter: Filter = TABS.some((tab) => tab.id === rawFilter) ? (rawFilter as Filter) : 'all';
  const page = Number(searchParams.get('page')) || 1;

  const listing = useAsync<Listing>(
    async () => {
      if (filter === 'favorites') {
        const result = await learningService.favorites(page, 12);
        return {
          courses: result.items.flatMap((favorite) => (favorite.course ? [favorite.course] : [])),
          progress: {},
          meta: result.meta,
        };
      }

      const result = await learningService.myCourses(STATUS_BY_FILTER[filter], page, 12);
      return {
        courses: result.items.flatMap((enrollment) => (enrollment.course ? [enrollment.course] : [])),
        progress: Object.fromEntries(
          result.items.map((enrollment) => [enrollment.course_id, enrollment.progress_percentage]),
        ),
        meta: result.meta,
      };
    },
    [filter, page],
  );

  const navigate = (next: { filter?: Filter; page?: number }) => {
    const params = new URLSearchParams();
    const nextFilter = next.filter ?? filter;
    if (nextFilter !== 'all') params.set('filter', nextFilter);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    router.push(`/my-courses${params.size > 0 ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const empty = EMPTY_COPY[filter];

  return (
    <>
      <PageHeader
        title="Meus cursos"
        description="Tudo o que você está estudando, concluiu ou guardou para depois."
      />

      <Tabs
        items={TABS}
        active={filter}
        onChange={(id) => navigate({ filter: id as Filter, page: 1 })}
        className="mb-6"
      />

      {listing.loading ? (
        <CourseGridSkeleton count={6} />
      ) : listing.error ? (
        <ErrorState title="Não foi possível carregar seus cursos" onRetry={listing.reload} />
      ) : !listing.data || listing.data.courses.length === 0 ? (
        <EmptyState
          icon={filter === 'favorites' ? <LuHeart className="size-10" /> : <LuBookOpen className="size-10" />}
          title={empty.title}
          description={empty.description}
          action={{ label: 'Explorar cursos', href: '/courses' }}
        />
      ) : (
        <>
          <CourseGrid
            courses={listing.data.courses}
            progressByCourse={filter === 'favorites' ? undefined : listing.data.progress}
            hrefFor={filter === 'favorites' ? undefined : (course) => `/learn/${course.slug}`}
          />

          <Pagination
            className="mt-8"
            page={listing.data.meta.page}
            totalPages={listing.data.meta.totalPages}
            onChange={(next) => navigate({ page: next })}
          />
        </>
      )}

      {filter === 'completed' && listing.data && listing.data.courses.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/certificates" variant="outline">
            Ver meus certificados
          </ButtonLink>
        </div>
      )}
    </>
  );
}

export default function MyCoursesPage() {
  return (
    <AppShell>
      <Suspense fallback={<CourseGridSkeleton count={6} />}>
        <MyCoursesContent />
      </Suspense>
    </AppShell>
  );
}
