'use client';

import { Suspense, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LuCircleCheck, LuCircleX, LuEllipsisVertical, LuEye, LuSearch } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { CourseStatusBadge } from '@/components/authoring/CourseStatusBadge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { ErrorState, TableSkeleton } from '@/components/ui/Feedback';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/admin';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { formatDate, STATUS_LABELS } from '@/lib/format';
import { COURSE_STATUSES } from '@/types/api';
import type { Course, CourseStatus } from '@/types/api';

type PendingReview = { course: Course; approve: boolean } | null;

function isCourseStatus(value: string | null): value is CourseStatus {
  return COURSE_STATUSES.includes(value as CourseStatus);
}

function AdminCoursesContent() {
  const searchParams = useSearchParams();
  const toast = useToast();

  const initialStatus = searchParams.get('status');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState<CourseStatus | ''>(isCourseStatus(initialStatus) ? initialStatus : '');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const [pending, setPending] = useState<PendingReview>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const [working, setWorking] = useState(false);

  const categories = useAsync(() => courseService.categories(), []);
  const courses = useAsync(
    () => adminService.courses({ search: appliedSearch, status, category, page, limit: 15 }),
    [appliedSearch, status, category, page],
  );

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
  }

  function openReview(course: Course, approve: boolean) {
    setNote('');
    setNoteError(undefined);
    setPending({ course, approve });
  }

  async function submitReview() {
    if (!pending) return;

    if (!pending.approve && note.trim().length === 0) {
      setNoteError('Explique o que precisa ser ajustado — o professor verá esta mensagem.');
      return;
    }

    setWorking(true);
    try {
      await adminService.reviewCourse(pending.course.id, pending.approve, note.trim());
      toast.success(pending.approve ? 'Curso aprovado e publicado no catálogo.' : 'Curso devolvido ao professor com o motivo.');
      setPending(null);
      courses.reload();
    } catch (err) {
      if (err instanceof ApiError && err.fields.note) {
        setNoteError(err.fields.note);
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível registrar a revisão.');
        // 409: outra pessoa já revisou ou o professor cancelou o envio.
        if (err instanceof ApiError && err.status === 409) {
          setPending(null);
          courses.reload();
        }
      }
    } finally {
      setWorking(false);
    }
  }

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
            <Link href={`/courses/${course.slug}`} className="truncate font-semibold text-ink hover:text-brand-500">
              {course.title}
            </Link>
            <span className="text-xs text-ink-muted">
              {course.category?.name ?? 'Sem categoria'} · {course.lessons_count} aulas
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Professor',
      hideOnMobile: true,
      render: (course) =>
        course.teacher ? (
          <Link href={`/teachers/${course.teacher.id}`} className="text-ink hover:text-brand-500">
            {course.teacher.name}
          </Link>
        ) : (
          <span className="text-ink-muted">—</span>
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
      hideOnMobile: true,
      render: (course) => <span className="tabular-nums">{course.students_count}</span>,
    },
    {
      key: 'date',
      header: 'Enviado / atualizado',
      hideOnMobile: true,
      render: (course) => (
        <span className="text-ink-muted">
          {formatDate(course.status === 'PENDING_REVIEW' ? course.submitted_at : course.updated_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      render: (course) => (
        <Dropdown
          label={`Ações do curso ${course.title}`}
          trigger={() => (
            <span className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink">
              <LuEllipsisVertical className="size-5" aria-hidden="true" />
            </span>
          )}
        >
          <DropdownItem icon={<LuEye className="size-4" />} onClick={() => window.open(`/courses/${course.slug}`, '_blank')}>
            Visualizar
          </DropdownItem>
          {course.status === 'PENDING_REVIEW' && (
            <>
              <DropdownDivider />
              <DropdownItem icon={<LuCircleCheck className="size-4" />} onClick={() => openReview(course, true)}>
                Aprovar e publicar
              </DropdownItem>
              <DropdownItem tone="danger" icon={<LuCircleX className="size-4" />} onClick={() => openReview(course, false)}>
                Reprovar
              </DropdownItem>
            </>
          )}
        </Dropdown>
      ),
    },
  ];

  return (
    <>
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
            setStatus(event.target.value as CourseStatus | '');
            setPage(1);
          }}
          options={COURSE_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))}
          containerClassName="sm:w-44"
        />
        <Select
          label="Categoria"
          placeholder="Todas"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          options={(categories.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
          containerClassName="sm:w-52"
        />
      </form>

      {courses.error ? (
        <ErrorState title="Não foi possível carregar os cursos" onRetry={courses.reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={courses.data?.items ?? []}
            rowKey={(course) => course.id}
            loading={courses.loading && !courses.data}
            caption="Cursos da plataforma"
            emptyTitle={status === 'PENDING_REVIEW' ? 'Nenhum curso aguardando revisão' : 'Nenhum curso encontrado'}
            emptyDescription={status === 'PENDING_REVIEW' ? 'A fila está em dia.' : 'Ajuste a busca ou os filtros.'}
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

      <ConfirmDialog
        open={pending?.approve === true}
        onClose={() => setPending(null)}
        onConfirm={submitReview}
        loading={working}
        destructive={false}
        title="Aprovar curso?"
        description={`"${pending?.course.title}" entra no catálogo e fica disponível para matrícula. O professor será notificado.`}
        confirmLabel="Aprovar e publicar"
      />

      <Modal
        open={pending?.approve === false}
        onClose={() => setPending(null)}
        dismissible={!working}
        title="Reprovar curso"
        description={pending?.course.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={working}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={submitReview} loading={working}>
              Reprovar
            </Button>
          </>
        }
      >
        <Textarea
          label="Motivo"
          required
          maxLength={1000}
          rows={5}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            if (noteError) setNoteError(undefined);
          }}
          error={noteError}
          hint="O curso volta para rascunho e o professor vê este texto no editor."
          placeholder="Ex.: o módulo 2 não tem aulas obrigatórias e a descrição promete um projeto final que não existe."
        />
      </Modal>
    </>
  );
}

export default function AdminCoursesPage() {
  return (
    <AppShell>
      <PageHeader title="Cursos" description="Revise envios de professores e acompanhe todos os cursos da plataforma." />
      {/* useSearchParams exige Suspense para não bloquear o prerender. */}
      <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
        <AdminCoursesContent />
      </Suspense>
    </AppShell>
  );
}
