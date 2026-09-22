'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import { CurriculumAccordion } from '@/components/courses/CurriculumAccordion';
import { ReviewsSection } from '@/components/courses/ReviewsSection';
import { Avatar, Badge, Card, Stars } from '@/components/ui/Display';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { courseService } from '@/services/courses';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import {
  COURSE_STATUS_TONES,
  LEVEL_LABELS,
  STATUS_LABELS,
  formatCompact,
  formatDate,
  formatDuration,
  formatPercent,
  formatRating,
} from '@/lib/format';
import type { Course, CourseProgress } from '@/types/api';

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-full max-w-xl" />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

/**
 * Cartão lateral com a chamada principal. O texto do botão depende de quem
 * olha: visitante, aluno sem matrícula, aluno matriculado ou o próprio autor.
 */
function EnrollCard({
  course,
  progress,
  onEnrolled,
}: {
  course: Course;
  progress: CourseProgress | null;
  onEnrolled: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  const [enrolling, setEnrolling] = useState(false);
  const [favorite, setFavorite] = useState<boolean | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isStudent = user?.role === 'STUDENT';
  const isAuthor = user?.id === course.teacher_id;
  const isEnrolled = progress !== null && progress.status !== 'CANCELLED';

  useAsync(
    async () => {
      const page = await learningService.favorites(1, 100);
      setFavorite(page.items.some((item) => item.course_id === course.id));
      return null;
    },
    [course.id],
    { enabled: isStudent },
  );

  async function enroll() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
      return;
    }

    setEnrolling(true);
    try {
      await learningService.enroll(course.id);
      toast.success('Matrícula confirmada. Bons estudos!');
      onEnrolled();
      router.push(`/learn/${course.slug}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível concluir a matrícula.');
      setEnrolling(false);
    }
  }

  async function toggleFavorite() {
    setTogglingFavorite(true);
    try {
      if (favorite) {
        await learningService.removeFavorite(course.id);
        toast.info('Removido dos favoritos.');
      } else {
        await learningService.addFavorite(course.id);
        toast.success('Adicionado aos favoritos.');
      }
      setFavorite(!favorite);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível atualizar os favoritos.');
    } finally {
      setTogglingFavorite(false);
    }
  }

  async function cancelEnrollment() {
    setCancelling(true);
    try {
      await learningService.cancelEnrollment(course.id);
      toast.info('Matrícula cancelada. Seu progresso fica guardado caso você volte.');
      setConfirmCancel(false);
      onEnrolled();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível cancelar a matrícula.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Card className="flex flex-col overflow-hidden lg:sticky lg:top-24">
      <div className="aspect-video bg-brand-600">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- thumbnail externa cadastrada pelo professor
          <img src={course.thumbnail_url} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-5xl font-bold text-white/90">
            {course.title.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
        <p className="text-2xl font-bold text-ink">{course.is_free ? 'Gratuito' : 'Pago'}</p>

        {isEnrolled && progress && (
          <div className="flex flex-col gap-1.5">
            <ProgressBar value={progress.progress_percentage} label="Seu progresso no curso" />
            <p className="text-sm text-ink-muted">
              {formatPercent(progress.progress_percentage)} concluído ·{' '}
              {progress.completed_lessons} de {progress.required_lessons} aulas
            </p>
          </div>
        )}

        {isAuthor || user?.role === 'ADMIN' ? (
          <ButtonLink
            href={user?.role === 'ADMIN' && !isAuthor ? '/admin/courses' : `/teacher/courses/${course.id}`}
            fullWidth
            size="lg"
          >
            Gerenciar curso
          </ButtonLink>
        ) : isEnrolled ? (
          <ButtonLink href={`/learn/${course.slug}`} fullWidth size="lg">
            {progress?.status === 'COMPLETED'
              ? 'Rever conteúdo'
              : (progress?.progress_percentage ?? 0) > 0
                ? 'Continuar curso'
                : 'Começar a estudar'}
          </ButtonLink>
        ) : user?.role === 'TEACHER' ? (
          <p className="text-sm text-ink-muted">
            Contas de professor não fazem matrícula. Use uma conta de aluno para estudar.
          </p>
        ) : (
          <Button fullWidth size="lg" loading={enrolling} onClick={enroll} disabled={course.status !== 'PUBLISHED'}>
            {progress?.status === 'CANCELLED' ? 'Retomar matrícula' : 'Matricular-se gratuitamente'}
          </Button>
        )}

        {isStudent && favorite !== null && (
          <Button variant="outline" fullWidth loading={togglingFavorite} onClick={toggleFavorite}>
            {favorite ? '♥ Nos favoritos' : '♡ Favoritar'}
          </Button>
        )}

        <ul className="flex flex-col gap-2 border-t border-border-subtle pt-4 text-sm text-ink-muted">
          <li className="flex justify-between">
            <span>Aulas</span>
            <span className="font-medium text-ink">{course.lessons_count}</span>
          </li>
          <li className="flex justify-between">
            <span>Duração</span>
            <span className="font-medium text-ink">{formatDuration(course.duration_seconds)}</span>
          </li>
          <li className="flex justify-between">
            <span>Nível</span>
            <span className="font-medium text-ink">{LEVEL_LABELS[course.level]}</span>
          </li>
          <li className="flex justify-between">
            <span>Certificado</span>
            <span className="font-medium text-ink">Ao concluir</span>
          </li>
        </ul>

        {isStudent && isEnrolled && progress?.status === 'ACTIVE' && (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="cursor-pointer self-center text-xs font-medium text-ink-muted hover:text-danger"
          >
            Cancelar matrícula
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancelEnrollment}
        loading={cancelling}
        title="Cancelar matrícula?"
        description="O curso sai da sua lista de estudos. Seu progresso fica salvo e volta se você se matricular de novo."
        confirmLabel="Cancelar matrícula"
        cancelLabel="Manter"
      />
    </Card>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoading: authLoading } = useAuth();

  const detail = useAsync(() => courseService.detail(slug), [slug]);
  const courseId = detail.data?.course.id;
  const isStudent = user?.role === 'STUDENT';

  // 404 aqui significa "não matriculado", e não erro de página.
  const progress = useAsync(
    async () => {
      try {
        return await learningService.courseProgress(courseId!);
      } catch (err) {
        if (err instanceof ApiError && err.isNotFound) return null;
        throw err;
      }
    },
    [courseId],
    { enabled: Boolean(courseId) && isStudent && !authLoading },
  );

  if (detail.loading) {
    return (
      <AppShell>
        <DetailSkeleton />
      </AppShell>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <AppShell>
        {detail.error?.isNotFound ? (
          <EmptyState
            title="Curso não encontrado"
            description="Ele pode ter sido removido ou ainda não foi publicado."
            action={{ label: 'Explorar catálogo', href: '/courses' }}
          />
        ) : (
          <ErrorState title="Não foi possível carregar o curso" onRetry={detail.reload} />
        )}
      </AppShell>
    );
  }

  const { course, modules } = detail.data;
  const teacher = course.teacher;
  const enrollment = progress.data ?? null;
  const canReview = enrollment !== null && enrollment.status !== 'CANCELLED';

  return (
    <AppShell bare>
      <section className="border-b border-border-subtle bg-brand-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8 lg:pr-[26rem]">
          <nav aria-label="Trilha" className="text-sm text-brand-100">
            <Link href="/courses" className="hover:underline">
              Cursos
            </Link>
            {course.category && (
              <>
                <span className="mx-2" aria-hidden="true">›</span>
                <Link href={`/courses?category=${course.category.id}`} className="hover:underline">
                  {course.category.name}
                </Link>
              </>
            )}
          </nav>

          {course.status !== 'PUBLISHED' && (
            <Badge tone={COURSE_STATUS_TONES[course.status]} className="w-fit">
              {STATUS_LABELS[course.status]} — visível só para você
            </Badge>
          )}

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
          <p className="text-lg text-brand-100">{course.short_description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-brand-100">
            {course.rating_count > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-warning">{formatRating(course.rating_average)}</span>
                <Stars value={course.rating_average} size="sm" />
                <span>({course.rating_count})</span>
              </span>
            ) : (
              <span>Sem avaliações ainda</span>
            )}
            <span>{formatCompact(course.students_count)} alunos</span>
            <span>{LEVEL_LABELS[course.level]}</span>
            <span>Atualizado em {formatDate(course.updated_at)}</span>
          </div>

          {teacher && (
            <p className="text-sm text-brand-100">
              Criado por{' '}
              <Link href={`/teachers/${teacher.id}`} className="font-semibold text-white underline-offset-2 hover:underline">
                {teacher.name}
              </Link>
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="order-2 flex min-w-0 flex-col gap-10 lg:order-1">
          {course.objectives && course.objectives.length > 0 && (
            <section aria-labelledby="objectives-title" className="rounded-xl border border-border-subtle p-5">
              <h2 id="objectives-title" className="mb-4 text-xl font-bold text-ink">
                O que você vai aprender
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.objectives.map((objective) => (
                  <li key={objective} className="flex gap-2 text-sm text-ink">
                    <CheckIcon />
                    {objective}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="curriculum-title" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="curriculum-title" className="text-xl font-bold text-ink">
                Conteúdo do curso
              </h2>
              <p className="text-sm text-ink-muted">
                {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} · {course.lessons_count} aulas ·{' '}
                {formatDuration(course.duration_seconds)}
              </p>
            </div>
            <CurriculumAccordion modules={modules} />
          </section>

          {course.requirements && course.requirements.length > 0 && (
            <section aria-labelledby="requirements-title">
              <h2 id="requirements-title" className="mb-3 text-xl font-bold text-ink">
                Requisitos
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
                {course.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="description-title">
            <h2 id="description-title" className="mb-3 text-xl font-bold text-ink">
              Descrição
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-ink">{course.description}</p>
          </section>

          {teacher && (
            <section aria-labelledby="teacher-title" className="flex flex-col gap-3">
              <h2 id="teacher-title" className="text-xl font-bold text-ink">
                Sobre o professor
              </h2>
              <div className="flex gap-4">
                <Avatar name={teacher.name} src={teacher.avatar_url} size="lg" />
                <div className="flex min-w-0 flex-col gap-1">
                  <Link href={`/teachers/${teacher.id}`} className="font-semibold text-brand-500 hover:underline">
                    {teacher.name}
                  </Link>
                  {teacher.headline && <p className="text-sm text-ink-muted">{teacher.headline}</p>}
                  {teacher.bio && <p className="mt-1 text-sm text-ink">{teacher.bio}</p>}
                </div>
              </div>
            </section>
          )}

          {course.status === 'PUBLISHED' && (
            <ReviewsSection
              course={course}
              canReview={canReview}
              progress={enrollment?.progress_percentage ?? 0}
            />
          )}
        </div>

        <div className="order-1 lg:order-2 lg:-mt-52">
          <EnrollCard course={course} progress={enrollment} onEnrolled={progress.reload} />
        </div>
      </div>
    </AppShell>
  );
}
