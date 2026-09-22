import Link from 'next/link';
import { cn } from '@/lib/cn';
import {
  COURSE_STATUS_TONES,
  LEVEL_LABELS,
  STATUS_LABELS,
  formatCompact,
  formatDuration,
  formatPercent,
  formatRating,
} from '@/lib/format';
import { Badge, Stars } from '@/components/ui/Display';
import { ProgressBar } from '@/components/ui/Feedback';
import type { Course } from '@/types/api';

interface CourseCardProps {
  course: Course;
  /** Quando informado, o card vira "continuar estudando". */
  progress?: number;
  href?: string;
  className?: string;
}

function Thumbnail({ course }: { course: Course }) {
  if (course.thumbnail_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- thumbnails vêm de URLs externas cadastradas pelo professor
      <img
        src={course.thumbnail_url}
        alt=""
        loading="lazy"
        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }

  // Sem capa cadastrada: bloco da marca com a inicial, em vez de imagem quebrada.
  return (
    <div className="grid size-full place-items-center bg-brand-600 text-3xl font-bold text-white/90">
      {course.title.charAt(0).toUpperCase()}
    </div>
  );
}

export function CourseCard({ course, progress, href, className }: CourseCardProps) {
  const target = href ?? `/courses/${course.slug}`;
  const showProgress = progress !== undefined;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface',
        'transition-shadow duration-200 hover:shadow-md focus-within:shadow-md',
        className,
      )}
    >
      <Link href={target} className="relative block aspect-video overflow-hidden">
        <Thumbnail course={course} />

        {course.status !== 'PUBLISHED' && (
          <span className="absolute left-2 top-2">
            <Badge tone={COURSE_STATUS_TONES[course.status]}>{STATUS_LABELS[course.status]}</Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs">
          {course.category && (
            <span className="font-semibold text-brand-500">{course.category.name}</span>
          )}
          <span className="text-ink-subtle">•</span>
          <span className="text-ink-muted">{LEVEL_LABELS[course.level]}</span>
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug text-ink">
          {/* O link cobre o card inteiro, mas o texto é o rótulo acessível. */}
          <Link href={target} className="outline-none after:absolute after:inset-0 after:content-['']">
            {course.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-ink-muted">{course.short_description}</p>

        {course.teacher && (
          <p className="text-sm text-ink-muted">
            por <span className="font-medium text-ink">{course.teacher.name}</span>
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          {showProgress ? (
            <>
              <ProgressBar
                value={progress}
                size="sm"
                label={`Progresso em ${course.title}`}
              />
              <span className="text-xs font-medium text-ink-muted">
                {formatPercent(progress)} concluído
              </span>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
              {course.rating_count > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Stars value={course.rating_average} size="sm" />
                  <span className="font-semibold text-ink">
                    {formatRating(course.rating_average)}
                  </span>
                  <span>({course.rating_count})</span>
                </span>
              ) : (
                <span>Sem avaliações</span>
              )}

              <span>{course.lessons_count} aulas</span>

              {course.duration_seconds > 0 && (
                <span>{formatDuration(course.duration_seconds)}</span>
              )}

              {course.students_count > 0 && (
                <span>{formatCompact(course.students_count)} alunos</span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function CourseGrid({
  courses,
  progressByCourse,
  hrefFor,
  className,
}: {
  courses: Course[];
  /** Mapa course_id -> percentual, para a grade de "meus cursos". */
  progressByCourse?: Record<string, number>;
  hrefFor?: (course: Course) => string;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progress={progressByCourse?.[course.id]}
          href={hrefFor?.(course)}
        />
      ))}
    </div>
  );
}
