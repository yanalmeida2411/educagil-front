'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Impede fechar por Esc ou clique no fundo — use durante uma submissão. */
  dismissible?: boolean;
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

/** Elementos que podem receber foco dentro do diálogo. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Guarda quem tinha o foco para devolvê-lo ao fechar.
  const previousFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    if (dismissible) onClose();
  }, [dismissible, onClose]);

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;

    // Trava a rolagem do fundo enquanto o diálogo está aberto.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Move o foco para dentro do diálogo.
    const focusFirst = () => {
      const target =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    };
    const timer = window.setTimeout(focusFirst, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        return;
      }

      // Mantém o Tab circulando dentro do diálogo: sem isso o foco escapa
      // para a página atrás, que está visualmente inacessível.
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      previousFocus.current?.focus();
    };
  }, [open, close]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={close}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-surface shadow-xl',
          'sm:rounded-2xl',
          SIZES[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 id="modal-title" className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>

          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-1 -mt-1 cursor-pointer rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-border-subtle px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Ações destrutivas ganham o botão vermelho. */
  destructive?: boolean;
}

/** Confirmação para ações irreversíveis — exigida antes de excluir. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-muted">{description}</p>
    </Modal>
  );
}
