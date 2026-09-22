'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Card } from '@/components/ui/Display';

export default function VerifyCertificateFormPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) router.push(`/certificates/verify/${encodeURIComponent(normalized)}`);
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-lg flex-col gap-6 py-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-ink">Validar certificado</h1>
          <p className="text-ink-muted">
            Informe o código impresso no certificado para confirmar que ele foi emitido pela Educagil.
          </p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Código do certificado"
              placeholder="EDU-XXXX-XXXX-XXXX"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono uppercase"
              required
            />
            <Button type="submit" size="lg" disabled={code.trim().length === 0}>
              Validar
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
