import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Navbar } from './Navbar';

/** Rodapé enxuto — o do projeto antigo repetia links que não existiam. */
function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Educagil — aprendizado ágil, prático e contínuo.</p>

        <nav aria-label="Rodapé" className="flex items-center gap-4">
          <Link href="/courses" className="transition-colors hover:text-brand-500">
            Cursos
          </Link>
          <Link href="/certificates/verify" className="transition-colors hover:text-brand-500">
            Validar certificado
          </Link>
        </nav>
      </div>
    </footer>
  );
}

/**
 * Moldura padrão das páginas: navbar fixa, conteúdo centralizado e rodapé
 * colado embaixo mesmo em páginas curtas.
 */
export function AppShell({
  children,
  /** Telas de largura total, como o player, dispensam o container. */
  bare = false,
  hideFooter = false,
  className,
}: {
  children: ReactNode;
  bare?: boolean;
  hideFooter?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      <main
        className={cn(
          'flex-1',
          !bare && 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8',
          className,
        )}
      >
        {children}
      </main>

      {!hideFooter && <SiteFooter />}
    </div>
  );
}

/** Cabeçalho de página: título, descrição e ações à direita. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="text-ink-muted">{description}</p>}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
