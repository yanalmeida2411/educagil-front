import { cn } from '@/lib/cn';

/** Mesmas regras aplicadas pelo backend, para o erro aparecer antes do envio. */
export function passwordChecks(password: string) {
  return [
    { label: 'Ao menos 8 caracteres', ok: password.length >= 8 },
    { label: 'Uma letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Um número', ok: /\d/.test(password) },
    { label: 'Um caractere especial', ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return passwordChecks(password).every((check) => check.ok);
}

export function PasswordChecklist({ password }: { password: string }) {
  if (password.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1" aria-label="Requisitos da senha">
      {passwordChecks(password).map((check) => (
        <li
          key={check.label}
          className={cn(
            'flex items-center gap-1.5 text-xs',
            check.ok ? 'text-success' : 'text-ink-muted',
          )}
        >
          <span aria-hidden="true">{check.ok ? '✓' : '○'}</span>
          {check.label}
          <span className="sr-only">{check.ok ? ' (atendido)' : ' (pendente)'}</span>
        </li>
      ))}
    </ul>
  );
}
