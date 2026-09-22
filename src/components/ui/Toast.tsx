'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Feedback de sucesso/erro para ações do usuário. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast precisa estar dentro de <ToastProvider>.');
  }

  return context;
}

const DURATION = 4500;

const TONES: Record<ToastTone, { className: string; icon: ReactNode }> = {
  success: {
    className: 'border-success/30 bg-surface text-ink',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-success">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.53a.75.75 0 0 0-1.22-.87l-3.24 4.53-1.62-1.62a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.1l3.75-5.25Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    className: 'border-danger/30 bg-surface text-ink',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-danger">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    className: 'border-brand-200 bg-surface text-ink',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 text-brand-400">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.25v2.25H9a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-.25V9.75A.75.75 0 0 0 10 9H9Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const tone = TONES[toast.tone];

  return (
    <div
      // Erros interrompem a leitura; sucesso e info esperam uma pausa.
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border px-4 py-3',
        'shadow-lg animate-[toast-in_180ms_ease-out]',
        tone.className,
      )}
    >
      <span className="mt-0.5 shrink-0">{tone.icon}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dispensar"
        className="-mr-1 shrink-0 cursor-pointer rounded p-0.5 text-ink-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  // createPortal só pode rodar depois da hidratação.
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => push('success', message),
      error: (message: string) => push('error', message),
      info: (message: string) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-4 z-200 mx-auto flex w-full max-w-sm flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:mx-0 sm:px-0"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
