'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { LuLock, LuLogOut } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { PasswordChecklist, isStrongPassword } from '@/components/forms/PasswordChecklist';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Display';
import { Input } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth';
import { ApiError } from '@/lib/http';

function ChangePasswordCard() {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strong = isStrongPassword(next);
  const matches = next.length > 0 && next === confirm;
  const canSubmit = current.length > 0 && strong && matches;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      await authService.changePassword({ current_password: current, new_password: next });
      setCurrent('');
      setNext('');
      setConfirm('');
      toast.success('Senha alterada. As sessões em outros dispositivos foram encerradas.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="section" className="p-5 sm:p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink">
        <LuLock aria-hidden="true" /> Alterar senha
      </h2>
      <p className="mb-5 text-sm text-ink-muted">
        Por segurança, trocar a senha encerra suas sessões em outros dispositivos.
      </p>

      <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        <Input
          type="password"
          label="Senha atual"
          autoComplete="current-password"
          required
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <Input
            type="password"
            label="Nova senha"
            autoComplete="new-password"
            required
            value={next}
            valid={strong}
            onChange={(event) => setNext(event.target.value)}
          />
          <PasswordChecklist password={next} />
        </div>

        <Input
          type="password"
          label="Confirmar nova senha"
          autoComplete="new-password"
          required
          value={confirm}
          valid={matches}
          error={confirm.length > 0 && !matches ? 'As senhas não coincidem.' : undefined}
          onChange={(event) => setConfirm(event.target.value)}
        />

        <Button type="submit" loading={saving} disabled={!canSubmit} className="self-start">
          Salvar nova senha
        </Button>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const { signOut } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <AppShell>
      <PageHeader title="Configurações" description="Segurança e preferências da sua conta." />

      <div className="flex max-w-3xl flex-col gap-6">
        <ChangePasswordCard />

        <Card as="section" className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Sair da conta</h2>
            <p className="text-sm text-ink-muted">Encerra a sessão neste navegador.</p>
          </div>
          <Button variant="outline" leftIcon={<LuLogOut aria-hidden="true" />} onClick={() => setConfirmLogout(true)}>
            Sair
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => void signOut()}
        title="Sair da conta?"
        description="Você precisará entrar novamente para acessar seus cursos."
        confirmLabel="Sair"
        destructive={false}
      />
    </AppShell>
  );
}
