'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

// --- Badge -------------------------------------------------------------------

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted',
  brand: 'bg-brand-50 text-brand-600',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// --- Avatar ------------------------------------------------------------------

const AVATAR_SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
} as const;

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const shell = cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
    AVATAR_SIZES[size],
    className,
  );

  // Fallback para iniciais quando não há foto ou o carregamento falha.
  if (!src || failed) {
    return (
      <span className={cn(shell, 'bg-brand-400 font-semibold text-white')} aria-hidden="true">
        {initials(name)}
      </span>
    );
  }

  return (
    <span className={shell}>
      {/* eslint-disable-next-line @next/next/no-img-element -- avatares vêm de URLs arbitrárias de usuários */}
      <img
        src={src}
        alt={`Foto de ${name}`}
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

// --- Card --------------------------------------------------------------------

export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
}) {
  return (
    <Tag className={cn('rounded-xl border border-border-subtle bg-surface', className)}>
      {children}
    </Tag>
  );
}

/** Indicador numérico dos dashboards. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('flex items-start justify-between gap-3 p-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        <span className="text-2xl font-bold text-ink">{value}</span>
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </div>

      {icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-500">
          {icon}
        </span>
      )}
    </Card>
  );
}

// --- Estrelas ----------------------------------------------------------------

export function Stars({
  value,
  size = 'md',
  className,
}: {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  const dimension = size === 'sm' ? 'size-3.5' : 'size-4';

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rounded >= star;
        const half = !filled && rounded >= star - 0.5;

        return (
          <svg
            key={star}
            viewBox="0 0 20 20"
            className={cn(dimension, filled || half ? 'text-warning' : 'text-ink-subtle')}
          >
            <defs>
              <linearGradient id={`half-${star}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill={half ? `url(#half-${star})` : 'currentColor'}
              stroke={half ? 'currentColor' : 'none'}
              strokeWidth="1"
              d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.1l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
            />
          </svg>
        );
      })}
    </span>
  );
}

// --- Tabs --------------------------------------------------------------------

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('flex gap-1 overflow-x-auto border-b border-border-subtle', className)}
    >
      {items.map((item) => {
        const selected = item.id === active;

        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              'cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              selected
                ? 'border-brand-400 text-brand-500'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                  selected ? 'bg-brand-50 text-brand-600' : 'bg-surface-muted text-ink-muted',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// --- Accordion ---------------------------------------------------------------

export function Accordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn('border-b border-border-subtle last:border-b-0', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted"
      >
        <span className="flex min-w-0 flex-col">
          <span className="font-semibold text-ink">{title}</span>
          {subtitle && <span className="text-sm text-ink-muted">{subtitle}</span>}
        </span>

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={cn(
            'size-5 shrink-0 text-ink-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div id={panelId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
