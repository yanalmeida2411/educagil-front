import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { AUTH_COOKIE } from './env';
import type { Role, Session, User } from '@/types/api';

/**
 * Sessão persistida no cookie.
 *
 * O papel é guardado aqui apenas para o frontend decidir o que renderizar
 * sem esperar uma requisição. Ele NÃO é fonte de autoridade: toda permissão
 * real é verificada no backend a partir do papel assinado dentro do JWT.
 * Adulterar este cookie muda a interface, e nada mais.
 */
export interface StoredSession {
  access: string;
  refresh: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar_url: string | null;
  };
}

const MAX_AGE = 60 * 60 * 24 * 7;

type CookieContext = Parameters<typeof parseCookies>[0] & Parameters<typeof setCookie>[0];

/** Lê a sessão do cookie. Nunca lança: cookie corrompido equivale a deslogado. */
export function readSession(ctx?: CookieContext): StoredSession | null {
  try {
    const raw = parseCookies(ctx)[AUTH_COOKIE];
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as StoredSession).access !== 'string' ||
      typeof (parsed as StoredSession).user?.id !== 'string'
    ) {
      return null;
    }

    return parsed as StoredSession;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession, ctx?: CookieContext): void {
  setCookie(ctx, AUTH_COOKIE, JSON.stringify(session), {
    maxAge: MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearSession(ctx?: CookieContext): void {
  destroyCookie(ctx, AUTH_COOKIE, { path: '/' });
}

/** Converte a resposta de login/registro no formato guardado no cookie. */
export function sessionFromApi(session: Session): StoredSession {
  return {
    access: session.access,
    refresh: session.refresh,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatar_url: session.user.avatar_url,
    },
  };
}

/** Atualiza os dados do usuário no cookie após uma edição de perfil. */
export function patchSessionUser(user: User, ctx?: CookieContext): void {
  const current = readSession(ctx);
  if (!current) return;

  writeSession(
    {
      ...current,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    },
    ctx,
  );
}
