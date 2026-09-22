'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DropdownProps {
  /** Gatilho: recebe o estado para desenhar seta, destaque etc. */
  trigger: (props: { open: boolean }) => ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  label?: string;
}

/**
 * Menu suspenso acessível: fecha no Esc, ao clicar fora e ao escolher um item.
 */
export function Dropdown({
  trigger,
  children,
  align = 'right',
  className,
  menuClassName,
  label = 'Abrir menu',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className="cursor-pointer"
      >
        {trigger({ open })}
      </button>

      {open && (
        <div
          role="menu"
          // Fecha ao acionar qualquer item, sem cada item precisar saber disso.
          onClick={() => setOpen(false)}
          className={cn(
            'absolute z-50 mt-2 min-w-52 overflow-hidden rounded-xl border border-border-subtle',
            'bg-surface py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  tone = 'default',
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'danger';
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors',
        tone === 'danger'
          ? 'text-danger hover:bg-danger/5'
          : 'text-ink hover:bg-surface-muted',
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-border-subtle" role="separator" />;
}
