'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { CourseGrid } from '@/components/courses/CourseCard';
import { CourseGridSkeleton, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { courseService } from '@/services/courses';
import { LEVEL_LABELS } from '@/lib/format';
import { COURSE_LEVELS } from '@/types/api';
import type { Category, Course, CourseLevel, CourseQuery, PaginationMeta } from '@/types/api';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'popular', label: 'Mais populares' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'title', label: 'Ordem alfabética' },
];

const LEVEL_OPTIONS = COURSE_LEVELS.map((level) => ({
  value: level,
  label: LEVEL_LABELS[level],
}));

const RATING_OPTIONS = [
  { value: '4', label: '4 estrelas ou mais' },
  { value: '3', label: '3 estrelas ou mais' },
];

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // A busca digitada vive em estado local; os demais filtros vão para a URL
  // na hora, para o catálogo continuar compartilhável por link.
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  const query: CourseQuery = {
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    level: (searchParams.get('level') as CourseLevel | null) ?? undefined,
    rating: Number(searchParams.get('rating')) || undefined,
    sort: (searchParams.get('sort') as CourseQuery['sort']) ?? 'recent',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  };

  const updateParams = useCallback(
    (changes: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(changes).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      // Qualquer mudança de filtro volta para a primeira página.
      if (!('page' in changes)) params.delete('page');

      router.push(`/courses?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  useEffect(() => {
    courseService.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    courseService
      .list(query)
      .then((page) => {
        if (!active) return;
        setCourses(page.items);
        setMeta(page.meta);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reexecuta quando a URL muda
  }, [searchParams]);

  const hasFilters = Boolean(
    query.search || query.category || query.level || query.rating,
  );

  return (
    <>
      <PageHeader
        title="Catálogo de cursos"
        description="Encontre o próximo passo da sua trilha de aprendizado."
      />

      <form
        className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          updateParams({ search: searchInput.trim() || undefined });
        }}
      >
        <Input
          label="Buscar"
          placeholder="Busque por título ou assunto"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          containerClassName="flex-1"
          leftIcon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4.5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 3.39 9.84l3.63 3.64a.75.75 0 1 0 1.06-1.06l-3.63-3.64A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        <Select
          label="Categoria"
          placeholder="Todas"
          value={query.category ?? ''}
          onChange={(event) => updateParams({ category: event.target.value || undefined })}
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          containerClassName="lg:w-52"
        />

        <Select
          label="Nível"
          placeholder="Todos"
          value={query.level ?? ''}
          onChange={(event) => updateParams({ level: event.target.value || undefined })}
          options={LEVEL_OPTIONS}
          containerClassName="lg:w-44"
        />

        <Select
          label="Avaliação"
          placeholder="Qualquer"
          value={query.rating ? String(query.rating) : ''}
          onChange={(event) => updateParams({ rating: event.target.value || undefined })}
          options={RATING_OPTIONS}
          containerClassName="lg:w-48"
        />

        <Select
          label="Ordenar"
          value={query.sort ?? 'recent'}
          onChange={(event) => updateParams({ sort: event.target.value })}
          options={SORT_OPTIONS}
          containerClassName="lg:w-44"
        />

        <Button type="submit" className="lg:mb-0">
          Buscar
        </Button>
      </form>

      {hasFilters && (
        <div className="mb-4 flex items-center gap-3">
          <p className="text-sm text-ink-muted">
            {meta?.total ?? 0} {meta?.total === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              router.push('/courses');
            }}
            className="cursor-pointer text-sm font-semibold text-brand-500 hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {loading ? (
        <CourseGridSkeleton count={6} />
      ) : failed ? (
        <ErrorState
          title="Não foi possível carregar o catálogo"
          description="Verifique sua conexão e tente novamente."
          onRetry={() => router.refresh()}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          title="Nenhum curso encontrado"
          description={
            hasFilters
              ? 'Tente ajustar os filtros ou buscar por outro termo.'
              : 'Ainda não há cursos publicados na plataforma.'
          }
          action={hasFilters ? { label: 'Limpar filtros', onClick: () => router.push('/courses') } : undefined}
        />
      ) : (
        <>
          <CourseGrid courses={courses} />

          {meta && meta.totalPages > 1 && (
            <Pagination
              className="mt-8"
              page={meta.page}
              totalPages={meta.totalPages}
              onChange={(page) => {
                updateParams({ page: String(page) });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </>
      )}
    </>
  );
}

export default function CoursesPage() {
  return (
    <AppShell>
      <Suspense fallback={<CourseGridSkeleton count={6} />}>
        <CatalogContent />
      </Suspense>
    </AppShell>
  );
}
