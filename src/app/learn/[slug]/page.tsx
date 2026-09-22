'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  LuAward,
  LuChevronLeft,
  LuChevronRight,
  LuCircleCheck,
  LuFileDown,
  LuListChecks,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuX,
} from 'react-icons/lu';

import { Navbar } from '@/components/layout/Navbar';
import { LessonSidebar } from '@/components/learning/LessonSidebar';
import { LessonComments } from '@/components/learning/LessonComments';
import { QuizRunner } from '@/components/learning/QuizRunner';
import { RichText } from '@/components/learning/RichText';
import { VideoPlayer, resolveVideo } from '@/components/learning/VideoPlayer';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Display';
import { EmptyState, ErrorState, ProgressBar, Skeleton } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { cn } from '@/lib/cn';
import { LESSON_TYPE_LABELS, formatPercent } from '@/lib/format';
import type { Certificate, Enrollment, Lesson } from '@/types/api';

/** Intervalo entre gravações do tempo assistido enquanto o vídeo toca. */
const PROGRESS_FLUSH_MS = 15_000;

function LessonBody({
  lesson,
  startAt,
  onVideoProgress,
  onQuizPassed,
}: {
  lesson: Lesson;
  startAt: number;
  onVideoProgress: (seconds: number) => void;
  onQuizPassed: (e: Enrollment | null, c: Certificate | null) => void;
}) {
  switch (lesson.type) {
    case 'VIDEO':
      return lesson.video_url ? (
        <VideoPlayer url={lesson.video_url} title={lesson.title} startAt={startAt} onProgress={onVideoProgress} />
      ) : (
        <EmptyState title="Vídeo indisponível" description="O professor ainda não cadastrou o vídeo desta aula." />
      );

    case 'TEXT':
      return lesson.content ? (
        <RichText source={lesson.content} />
      ) : (
        <EmptyState title="Conteúdo em preparação" />
      );

    case 'PDF':
      return lesson.material_url ? (
        <div className="flex flex-col gap-4">
          <iframe
            src={lesson.material_url}
            title={`Material: ${lesson.title}`}
            className="h-[70vh] w-full rounded-xl border border-border-subtle bg-surface-muted"
          />
          <a
            href={lesson.material_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 font-semibold text-brand-500 hover:underline"
          >
            <LuFileDown aria-hidden="true" /> Baixar material
          </a>
        </div>
      ) : (
        <EmptyState title="Material indisponível" />
      );

    case 'QUIZ':
      return <QuizRunner lessonId={lesson.id} onPassed={onQuizPassed} />;
  }
}

function PlayerSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden w-80 flex-col gap-3 border-r border-border-subtle p-4 lg:flex">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="aspect-video w-full max-w-4xl" />
        </div>
      </div>
    </div>
  );
}

function PlayerContent() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const player = useAsync(() => learningService.player(slug), [slug]);

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState<Enrollment['status']>('ACTIVE');
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!player.data) return;
    setCompleted(player.data.progress);
    setPercentage(player.data.enrollment.progress_percentage);
    setStatus(player.data.enrollment.status);
  }, [player.data]);

  const lessons = useMemo(
    () => player.data?.modules.flatMap((module) => module.lessons ?? []) ?? [],
    [player.data],
  );

  // Aula aberta: a da URL, senão a última acessada, senão a próxima pendente.
  const currentLesson = useMemo(() => {
    if (lessons.length === 0 || !player.data) return null;
    const byId = (id: string | null | undefined) => (id ? lessons.find((lesson) => lesson.id === id) : undefined);

    return (
      byId(searchParams.get('lesson')) ??
      byId(player.data.enrollment.last_lesson_id) ??
      byId(player.data.next_lesson?.id) ??
      lessons[0] ??
      null
    );
  }, [lessons, player.data, searchParams]);

  const currentIndex = currentLesson ? lessons.findIndex((lesson) => lesson.id === currentLesson.id) : -1;
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;

  // Maior posição alcançada por aula nesta sessão, somada à que veio do
  // servidor. Fica num ref: atualizar estado a cada `timeupdate` renderizaria
  // a página várias vezes por segundo.
  const watchedRef = useRef<Record<string, number>>({});
  const sentRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!player.data) return;
    // Mescla pelo maior valor: um reload não pode apagar o que foi medido
    // nesta sessão e ainda não chegou ao servidor.
    for (const [lessonId, seconds] of Object.entries(player.data.watched_seconds ?? {})) {
      watchedRef.current[lessonId] = Math.max(watchedRef.current[lessonId] ?? 0, seconds);
      sentRef.current[lessonId] = Math.max(sentRef.current[lessonId] ?? 0, seconds);
    }
  }, [player.data]);

  const flushProgress = useCallback((lessonId: string) => {
    const seconds = Math.floor(watchedRef.current[lessonId] ?? 0);
    if (seconds <= (sentRef.current[lessonId] ?? 0)) return;

    sentRef.current[lessonId] = seconds;
    learningService.trackProgress(lessonId, seconds).catch(() => {
      // Deixa para a próxima rodada tentar de novo.
      sentRef.current[lessonId] = 0;
    });
  }, []);

  const onVideoProgress = useCallback(
    (seconds: number) => {
      if (!currentLesson || !Number.isFinite(seconds)) return;
      const previous = watchedRef.current[currentLesson.id] ?? 0;
      if (seconds > previous) watchedRef.current[currentLesson.id] = seconds;
    },
    [currentLesson],
  );

  // Registra a aula aberta como a última acessada — é o que alimenta o
  // "continuar estudando" — e grava o tempo assistido periodicamente, ao
  // trocar de aula e ao sair da página. Falhar aqui não deve atrapalhar a aula.
  useEffect(() => {
    if (!currentLesson) return;
    const lessonId = currentLesson.id;

    learningService.trackProgress(lessonId, 0).catch(() => undefined);

    const timer = window.setInterval(() => flushProgress(lessonId), PROGRESS_FLUSH_MS);
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushProgress(lessonId);
    };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onHide);
      flushProgress(lessonId);
    };
  }, [currentLesson, flushProgress]);

  const goTo = useCallback(
    (lessonId: string) => {
      setDrawerOpen(false);
      router.replace(`/learn/${slug}?lesson=${lessonId}`, { scroll: false });
      window.scrollTo({ top: 0 });
    },
    [router, slug],
  );

  const applyEnrollment = useCallback(
    (lessonId: string, enrollment: Enrollment | null, issued: Certificate | null) => {
      setCompleted((current) => ({ ...current, [lessonId]: true }));
      if (enrollment) {
        setPercentage(enrollment.progress_percentage);
        setStatus(enrollment.status);
      }
      if (issued) setCertificate(issued);
    },
    [],
  );

  async function markComplete() {
    if (!currentLesson) return;

    setCompleting(true);
    try {
      // Vídeo reproduzido aqui tem o tempo real medido; nos demais tipos (ou
      // vídeo externo) a duração cadastrada é a melhor estimativa disponível.
      const measured = watchedRef.current[currentLesson.id];
      const trackable =
        currentLesson.type === 'VIDEO' && currentLesson.video_url && resolveVideo(currentLesson.video_url).kind !== 'external';
      const watchedSeconds = trackable ? Math.floor(measured ?? 0) : currentLesson.duration_seconds;

      const result = await learningService.completeLesson(currentLesson.id, watchedSeconds);
      sentRef.current[currentLesson.id] = Math.max(sentRef.current[currentLesson.id] ?? 0, watchedSeconds);
      applyEnrollment(currentLesson.id, result.enrollment, result.certificate);
      if (!result.certificate) toast.success('Aula concluída.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível registrar a conclusão.');
    } finally {
      setCompleting(false);
    }
  }

  if (player.loading) return <PlayerSkeleton />;

  if (player.error || !player.data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-3xl px-4 py-16">
          {player.error?.isForbidden || player.error?.isNotFound ? (
            <EmptyState
              title={player.error.isNotFound ? 'Curso não encontrado' : 'Você não tem acesso a este curso'}
              description={player.error.message}
              action={{ label: 'Ver página do curso', href: `/courses/${slug}` }}
            />
          ) : (
            <ErrorState title="Não foi possível abrir a área de estudos" onRetry={player.reload} />
          )}
        </main>
      </div>
    );
  }

  const { course, modules } = player.data;
  const currentDone = currentLesson ? (completed[currentLesson.id] ?? false) : false;

  const sidebar = (
    <LessonSidebar
      modules={modules}
      currentLessonId={currentLesson?.id ?? null}
      completed={completed}
      onSelect={goTo}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      {/* Barra do curso: título, progresso e controles da sidebar. */}
      <div className="sticky top-16 z-40 flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:inline-flex"
          aria-label={sidebarOpen ? 'Recolher conteúdo do curso' : 'Mostrar conteúdo do curso'}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? <LuPanelLeftClose className="size-5" /> : <LuPanelLeftOpen className="size-5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label="Abrir conteúdo do curso"
          onClick={() => setDrawerOpen(true)}
        >
          <LuListChecks className="size-5" />
        </Button>

        <Link href={`/courses/${course.slug}`} className="min-w-0 flex-1 truncate font-semibold text-ink hover:text-brand-500">
          {course.title}
        </Link>

        <div className="hidden w-48 flex-col gap-1 sm:flex">
          <ProgressBar value={percentage} size="sm" label="Progresso no curso" />
          <span className="text-right text-xs text-ink-muted">{formatPercent(percentage)} concluído</span>
        </div>

        {status === 'COMPLETED' && (
          <Badge tone="success" className="hidden md:inline-flex">
            <LuAward aria-hidden="true" /> Concluído
          </Badge>
        )}
      </div>

      <div className="flex flex-1">
        {sidebarOpen && (
          <aside className="sticky top-[7.5rem] hidden h-[calc(100vh-7.5rem)] w-80 shrink-0 overflow-y-auto border-r border-border-subtle lg:block">
            {sidebar}
          </aside>
        )}

        {/* Drawer mobile */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Conteúdo do curso">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                <span className="font-semibold text-ink">Conteúdo do curso</span>
                <Button variant="ghost" size="sm" aria-label="Fechar" onClick={() => setDrawerOpen(false)}>
                  <LuX className="size-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">{sidebar}</div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          {!currentLesson ? (
            <div className="p-6">
              <EmptyState title="Este curso ainda não tem aulas" description="Volte em breve." />
            </div>
          ) : (
            <div className={cn('mx-auto flex flex-col gap-6 px-4 py-6 sm:px-6', currentLesson.type === 'VIDEO' ? 'max-w-5xl' : 'max-w-4xl')}>
              <header className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  Aula {currentIndex + 1} de {lessons.length} · {LESSON_TYPE_LABELS[currentLesson.type]}
                </p>
                <h1 className="text-2xl font-bold text-ink">{currentLesson.title}</h1>
                {currentLesson.description && currentLesson.type !== 'QUIZ' && (
                  <p className="text-ink-muted">{currentLesson.description}</p>
                )}
              </header>

              <LessonBody
                key={currentLesson.id}
                lesson={currentLesson}
                // O servidor cobre a primeira renderização, antes de o ref ser preenchido.
                startAt={Math.max(
                  watchedRef.current[currentLesson.id] ?? 0,
                  player.data.watched_seconds?.[currentLesson.id] ?? 0,
                )}
                onVideoProgress={onVideoProgress}
                onQuizPassed={(enrollment, issued) => applyEnrollment(currentLesson.id, enrollment, issued)}
              />

              <div className="flex flex-col-reverse gap-3 border-y border-border-subtle py-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  disabled={!previous}
                  onClick={() => previous && goTo(previous.id)}
                  leftIcon={<LuChevronLeft aria-hidden="true" />}
                >
                  Anterior
                </Button>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {currentLesson.type !== 'QUIZ' &&
                    (currentDone ? (
                      <span className="inline-flex h-11 items-center justify-center gap-2 px-3 font-semibold text-success">
                        <LuCircleCheck aria-hidden="true" /> Concluída
                      </span>
                    ) : (
                      <Button variant="secondary" loading={completing} onClick={markComplete}>
                        Marcar como concluída
                      </Button>
                    ))}

                  {next && (
                    <Button onClick={() => goTo(next.id)} rightIcon={<LuChevronRight aria-hidden="true" />}>
                      Próxima aula
                    </Button>
                  )}
                </div>
              </div>

              <LessonComments lessonId={currentLesson.id} teacherId={course.teacher_id} />
            </div>
          )}
        </main>
      </div>

      <Modal
        open={certificate !== null}
        onClose={() => setCertificate(null)}
        title="Curso concluído!"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCertificate(null)}>
              Continuar aqui
            </Button>
            <ButtonLink href="/certificates">Ver certificado</ButtonLink>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <LuAward className="size-14 text-warning" aria-hidden="true" />
          <p className="text-ink">
            Parabéns! Você concluiu <strong>{course.title}</strong> e seu certificado já foi emitido.
          </p>
          {certificate && (
            <p className="rounded-lg bg-surface-muted px-3 py-1.5 font-mono text-sm text-ink">
              {certificate.certificate_code}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<PlayerSkeleton />}>
      <PlayerContent />
    </Suspense>
  );
}
