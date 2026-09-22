import Link from 'next/link';
import { LuPlay } from 'react-icons/lu';

import { ButtonLink } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Feedback';
import { formatPercent } from '@/lib/format';
import type { Enrollment } from '@/types/api';

/** Card horizontal de "continuar estudando": capa, professor e progresso. */
export function ContinueCard({ enrollment }: { enrollment: Enrollment }) {
  const course = enrollment.course;
  if (!course) return null;

  const started = enrollment.progress_percentage > 0;
  const href = `/learn/${course.slug}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface sm:flex-row">
      <Link href={href} className="relative block aspect-video shrink-0 bg-brand-600 sm:w-48" tabIndex={-1}>
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- thumbnail externa cadastrada pelo professor
          <img src={course.thumbnail_url} alt="" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-3xl font-bold text-white/90">
            {course.title.charAt(0)}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-ink">
          <Link href={href} className="hover:text-brand-500">
            {course.title}
          </Link>
        </h3>
        {course.teacher && <p className="text-sm text-ink-muted">{course.teacher.name}</p>}

        <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-1">
            <ProgressBar value={enrollment.progress_percentage} size="sm" label={`Progresso em ${course.title}`} />
            <span className="text-xs text-ink-muted">{formatPercent(enrollment.progress_percentage)} concluído</span>
          </div>
          <ButtonLink href={href} size="sm" leftIcon={<LuPlay aria-hidden="true" />}>
            {started ? 'Continuar' : 'Começar'}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
