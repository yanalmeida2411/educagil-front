import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button, ButtonLink } from './Button';

// --- Skeleton ---------------------------------------------------------------

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-muted', className)}
    />
  );
}

/** Esqueleto de um card de curso, no mesmo formato do CourseCard real. */
export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={cn('h-10', c === 0 ? 'flex-[2]' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}

// --- Estados vazios e de erro ------------------------------------------------

interface StateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: StateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed',
        'border-border-subtle bg-surface-muted/50 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="text-ink-subtle">{icon}</div>}

      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-muted">{description}</p>}

      {action &&
        (action.href ? (
          <ButtonLink href={action.href} size="sm" className="mt-2">
            {action.label}
          </ButtonLink>
        ) : (
          <Button size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

export function ErrorState({
  title = 'Algo deu errado',
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/30',
        'bg-danger/5 px-6 py-12 text-center',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-10 text-danger" aria-hidden="true">
        <path
          d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-muted">{description}</p>}

      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/** Alerta inline para erros de formulário e avisos dentro de uma seção. */
export function Alert({
  tone = 'error',
  children,
  className,
}: {
  tone?: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}) {
  const TONES = {
    error: 'border-danger/30 bg-danger/5 text-danger',
    success: 'border-success/30 bg-success/5 text-success',
    warning: 'border-warning/30 bg-warning/5 text-warning',
    info: 'border-brand-200 bg-brand-50 text-brand-600',
  } as const;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-4 py-3 text-sm font-medium', TONES[tone], className)}
    >
      {children}
    </div>
  );
}

// --- Barra de progresso ------------------------------------------------------

export function ProgressBar({
  value,
  label,
  size = 'md',
  className,
}: {
  value: number;
  /** Rótulo para leitores de tela quando não há texto visível ao lado. */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progresso'}
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-muted',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-brand-400 transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
