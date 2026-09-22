'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { authService } from '@/services/auth';
import { ApiError } from '@/lib/http';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { PasswordChecklist, isStrongPassword } from './PasswordChecklist';

export default function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const strong = isStrongPassword(password);
  const matches = password.length > 0 && password === confirm;

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Link inválido</h1>
        <p className="text-sm text-ink-muted">
          Este endereço não contém um link de redefinição. Solicite um novo para continuar.
        </p>
        <ButtonLink href="/forgot-password" fullWidth>
          Solicitar novo link
        </ButtonLink>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Senha redefinida</h1>
        <Alert tone="success">
          Sua senha foi alterada. Por segurança, encerramos as sessões abertas em outros
          dispositivos.
        </Alert>
        <ButtonLink href="/login" fullWidth size="lg">
          Entrar com a nova senha
        </ButtonLink>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!strong || !matches) {
      setError('A senha precisa atender a todos os requisitos e as duas precisam coincidir.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Criar nova senha</h1>
        <p className="text-sm text-ink-muted">Escolha uma senha que você ainda não usou aqui.</p>
      </div>

      {error && (
        <Alert tone="error">
          {error}{' '}
          {error.includes('expirou') && (
            <Link href="/forgot-password" className="font-semibold underline">
              Solicitar novo link
            </Link>
          )}
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Input
          id="password"
          type="password"
          label="Nova senha"
          autoComplete="new-password"
          required
          value={password}
          valid={strong}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordChecklist password={password} />
      </div>

      <Input
        id="confirm"
        type="password"
        label="Confirmar nova senha"
        autoComplete="new-password"
        required
        value={confirm}
        valid={matches}
        error={confirm.length > 0 && !matches ? 'As senhas não coincidem.' : undefined}
        onChange={(event) => setConfirm(event.target.value)}
      />

      <Button type="submit" size="lg" fullWidth loading={loading}>
        {loading ? 'Salvando...' : 'Redefinir senha'}
      </Button>
    </form>
  );
}
