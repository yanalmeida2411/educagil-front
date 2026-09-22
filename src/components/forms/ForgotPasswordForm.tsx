'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';

import { authService } from '@/services/auth';
import { ApiError } from '@/lib/http';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const emailValid = EMAIL_PATTERN.test(email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setError(null);

    if (!emailValid) return;

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim().toLowerCase());
      setDevResetUrl(response.dev_reset_url ?? null);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Verifique seu e-mail</h1>
          <p className="text-sm text-ink-muted">
            Se existir uma conta para <strong className="text-ink">{email}</strong>, enviamos um
            link para criar uma nova senha. Ele vale por 1 hora.
          </p>
        </div>

        {devResetUrl && (
          <Alert tone="info">
            <p className="mb-2">
              Ambiente de desenvolvimento: não há envio de e-mail configurado, então o link
              aparece aqui.
            </p>
            <a href={devResetUrl} className="break-all font-semibold underline">
              Abrir link de redefinição
            </a>
          </Alert>
        )}

        <ButtonLink href="/login" variant="outline" fullWidth>
          Voltar para o login
        </ButtonLink>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setDevResetUrl(null);
          }}
          className="cursor-pointer text-sm font-medium text-brand-500 hover:underline"
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Esqueceu a senha?</h1>
        <p className="text-sm text-ink-muted">
          Sem problemas. Informe seu e-mail e enviaremos um link para criar uma nova.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Input
        id="email"
        type="email"
        label="E-mail"
        placeholder="voce@email.com"
        autoComplete="email"
        required
        value={email}
        valid={emailValid}
        error={touched && !emailValid ? 'Informe um e-mail válido.' : undefined}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => setTouched(true)}
      />

      <Button type="submit" size="lg" fullWidth loading={loading}>
        {loading ? 'Enviando...' : 'Enviar link'}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Lembrou a senha?{' '}
        <Link href="/login" className="font-semibold text-brand-500 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
