'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { LuPlus, LuSearch } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { TeacherCoursesTable } from '@/components/authoring/TeacherCoursesTable';
import { ButtonLink } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/Feedback';
import Pagination from '@/components/ui/Pagination';
import { teacherService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { STATUS_LABELS } from '@/lib/format';
import { COURSE_STATUSES } from '@/types/api';

export default function TeacherCoursesPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const courses = useAsync(
    () => teacherService.courses({ search: appliedSearch || undefined, status: status || undefined, page, limit: 10 }),
    [appliedSearch, status, page],
  );

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
  }

  return (
    <AppShell>
      <PageHeader
        title="Meus cursos"
        description="Crie, edite e acompanhe o status de revisão dos seus cursos."
        actions={
          <ButtonLink href="/teacher/courses/new" leftIcon={<LuPlus aria-hidden="true" />}>
            Novo curso
          </ButtonLink>
        }
      />

      <form onSubmit={onSearch} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Buscar"
          placeholder="Título do curso"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<LuSearch className="size-4" />}
          containerClassName="flex-1"
        />
        <Select
          label="Status"
          placeholder="Todos"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={COURSE_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))}
          containerClassName="sm:w-48"
        />
      </form>

      {courses.error ? (
        <ErrorState title="Não foi possível carregar seus cursos" onRetry={courses.reload} />
      ) : (
        <>
          <TeacherCoursesTable
            courses={courses.data?.items ?? []}
            loading={courses.loading}
            onChanged={courses.reload}
            emptyAction={!appliedSearch && !status}
          />
          {courses.data && (
            <Pagination
              className="mt-6"
              page={courses.data.meta.page}
              totalPages={courses.data.meta.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
