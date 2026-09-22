'use client';

import { useParams } from 'next/navigation';
import { LuPrinter } from 'react-icons/lu';

import { AppShell } from '@/components/layout/AppShell';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { formatDate } from '@/lib/format';

/**
 * Certificado em formato de impressão. "Salvar como PDF" na janela de
 * impressão do navegador cobre o download sem gerar PDF no servidor.
 */
export default function CertificateViewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const certificates = useAsync(() => learningService.certificates(), []);

  const certificate = certificates.data?.find((item) => item.id === id);

  return (
    <AppShell className="print:p-0">
      <style>{`@media print { header, footer, .no-print { display: none !important; } @page { size: landscape; margin: 0; } }`}</style>

      {certificates.loading ? (
        <Skeleton className="aspect-[1.414] w-full" />
      ) : certificates.error ? (
        <ErrorState title="Não foi possível carregar o certificado" onRetry={certificates.reload} />
      ) : !certificate ? (
        <EmptyState
          title="Certificado não encontrado"
          action={{ label: 'Meus certificados', href: '/certificates' }}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="no-print flex flex-wrap justify-between gap-3">
            <ButtonLink href="/certificates" variant="ghost">
              ← Meus certificados
            </ButtonLink>
            <Button onClick={() => window.print()} leftIcon={<LuPrinter aria-hidden="true" />}>
              Imprimir ou salvar PDF
            </Button>
          </div>

          <article className="relative mx-auto flex aspect-[1.414] w-full max-w-4xl flex-col items-center justify-center gap-4 overflow-hidden border-[10px] border-brand-600 bg-surface p-8 text-center sm:gap-6 sm:p-16 print:max-w-none print:border-[14px]">
            <div className="absolute inset-3 border border-brand-200" aria-hidden="true" />

            {/* eslint-disable-next-line @next/next/no-img-element -- logo estática da marca */}
            <img src="/assets/svg/educAgilPadrao.svg" alt="Educagil" className="h-8 sm:h-10" />

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500 sm:text-sm">
              Certificado de conclusão
            </p>

            <p className="text-sm text-ink-muted sm:text-base">Certificamos que</p>
            <p className="text-2xl font-bold text-ink sm:text-4xl">{user?.name ?? 'Aluno'}</p>
            <p className="max-w-xl text-sm text-ink-muted sm:text-base">
              concluiu com êxito o curso{' '}
              <strong className="text-ink">{certificate.course?.title ?? ''}</strong> na plataforma Educagil em{' '}
              {formatDate(certificate.issued_at)}.
            </p>

            <div className="mt-2 flex flex-col items-center gap-1 text-xs text-ink-muted sm:mt-6">
              <span>Código de validação</span>
              <span className="font-mono text-sm font-semibold text-ink">{certificate.certificate_code}</span>
              {/* Só renderiza depois do fetch no client, então window já existe. */}
              <span>Valide em {window.location.host}/certificates/verify</span>
            </div>
          </article>
        </div>
      )}
    </AppShell>
  );
}
