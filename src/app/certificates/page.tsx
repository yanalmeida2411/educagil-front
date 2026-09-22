'use client';

import Link from 'next/link';
import { LuAward, LuCopy, LuExternalLink, LuPrinter } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Display';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { formatDate } from '@/lib/format';

export default function CertificatesPage() {
  const toast = useToast();
  const certificates = useAsync(() => learningService.certificates(), []);

  async function copyLink(code: string) {
    const url = `${window.location.origin}/certificates/verify/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link de validação copiado.');
    } catch {
      toast.error('Não foi possível copiar. Copie o código manualmente.');
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Meus certificados"
        description="Compartilhe o link de validação para comprovar a conclusão dos cursos."
      />

      {certificates.loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : certificates.error ? (
        <ErrorState title="Não foi possível carregar seus certificados" onRetry={certificates.reload} />
      ) : !certificates.data || certificates.data.length === 0 ? (
        <EmptyState
          icon={<LuAward className="size-10" />}
          title="Nenhum certificado ainda"
          description="Conclua todas as aulas obrigatórias de um curso para receber o certificado automaticamente."
          action={{ label: 'Ir para meus cursos', href: '/my-courses' }}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {certificates.data.map((certificate) => (
            <li key={certificate.id}>
              <Card as="article" className="flex h-full flex-col gap-4 border-t-4 border-t-brand-400 p-5">
                <div className="flex items-start gap-3">
                  <LuAward className="size-8 shrink-0 text-warning" aria-hidden="true" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="font-semibold text-ink">
                      {certificate.course ? (
                        <Link href={`/courses/${certificate.course.slug}`} className="hover:text-brand-500">
                          {certificate.course.title}
                        </Link>
                      ) : (
                        'Curso'
                      )}
                    </h2>
                    <p className="text-sm text-ink-muted">Emitido em {formatDate(certificate.issued_at)}</p>
                  </div>
                </div>

                <p className="w-fit rounded-lg bg-surface-muted px-3 py-1.5 font-mono text-sm text-ink">
                  {certificate.certificate_code}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  <ButtonLink
                    href={`/certificates/${certificate.id}`}
                    size="sm"
                    leftIcon={<LuPrinter aria-hidden="true" />}
                  >
                    Ver e imprimir
                  </ButtonLink>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<LuCopy aria-hidden="true" />}
                    onClick={() => copyLink(certificate.certificate_code)}
                  >
                    Copiar link
                  </Button>
                  <ButtonLink
                    href={`/certificates/verify/${certificate.certificate_code}`}
                    size="sm"
                    variant="ghost"
                    leftIcon={<LuExternalLink aria-hidden="true" />}
                  >
                    Validação pública
                  </ButtonLink>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
