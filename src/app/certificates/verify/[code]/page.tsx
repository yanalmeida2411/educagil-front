'use client';

import { useParams } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Display';
import { ErrorState, Skeleton } from '@/components/ui/Feedback';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { formatDate } from '@/lib/format';

export default function VerifyCertificateResultPage() {
  const { code } = useParams<{ code: string }>();
  const decoded = decodeURIComponent(code);
  const result = useAsync(() => learningService.verifyCertificate(decoded), [decoded]);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-xl flex-col gap-6 py-8">
        {result.loading ? (
          <Skeleton className="h-64 w-full" />
        ) : result.error?.isNotFound ? (
          <Card className="flex flex-col items-center gap-3 border-danger/30 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-danger/10 text-2xl text-danger" aria-hidden="true">
              ✕
            </span>
            <h1 className="text-2xl font-bold text-ink">Certificado não encontrado</h1>
            <p className="text-ink-muted">
              Nenhum certificado da Educagil corresponde ao código{' '}
              <span className="font-mono font-semibold text-ink">{decoded}</span>. Confira se foi digitado
              corretamente.
            </p>
            <ButtonLink href="/certificates/verify" variant="outline">
              Tentar outro código
            </ButtonLink>
          </Card>
        ) : result.error || !result.data ? (
          <ErrorState title="Não foi possível validar agora" onRetry={result.reload} />
        ) : (
          <Card className="flex flex-col items-center gap-4 border-success/40 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-2xl text-success" aria-hidden="true">
              ✓
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-success">Certificado válido</p>
            <h1 className="text-2xl font-bold text-ink">{result.data.student_name}</h1>
            <p className="text-ink-muted">
              concluiu o curso <strong className="text-ink">{result.data.course_title}</strong> na Educagil
              em {formatDate(result.data.issued_at)}.
            </p>
            <p className="rounded-lg bg-surface-muted px-3 py-1.5 font-mono text-sm text-ink">
              {result.data.certificate_code}
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
