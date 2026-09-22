'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';
import { NOTIFICATIONS_CHANGED } from '@/lib/events';
import { ROLE_LABELS } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';
import { learningService } from '@/services/learning';
import { Avatar } from '@/components/ui/Display';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import type { Role } from '@/types/api';

interface NavLink {
  href: string;
  label: string;
}

const LINKS_BY_ROLE: Record<Role, NavLink[]> = {
  STUDENT: [
    { href: '/dashboard', label: 'Início' },
    { href: '/my-courses', label: 'Meus cursos' },
    { href: '/courses', label: 'Explorar' },
    { href: '/certificates', label: 'Certificados' },
  ],
  TEACHER: [
    { href: '/teacher', label: 'Início' },
    { href: '/teacher/courses', label: 'Meus cursos' },
    { href: '/courses', label: 'Explorar' },
  ],
  ADMIN: [
    { href: '/admin', label: 'Painel' },
    { href: '/admin/users', label: 'Usuários' },
    { href: '/admin/courses', label: 'Cursos' },
    { href: '/admin/categories', label: 'Categorias' },
  ],
};

const GUEST_LINKS: NavLink[] = [{ href: '/courses', label: 'Explorar cursos' }];

/** A logo muda conforme o papel — os SVGs já existiam no projeto. */
function logoFor(role: Role | undefined) {
  if (role === 'TEACHER') {
    return { full: '/assets/svg/educAgilPrafessores.svg', mini: '/assets/svg/educAgilProfessoresMini.svg' };
  }
  if (role === 'STUDENT') {
    return { full: '/assets/svg/educAgilAlunos.svg', mini: '/assets/svg/educAgilAlunosMini.svg' };
  }
  return { full: '/assets/svg/educAgilPadrao.svg', mini: '/assets/svg/educAgilPadraoMini.svg' };
}

function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();

  // Recarrega ao navegar e quando a página de notificações avisa que algo
  // foi lido — sem isso o contador ficaria desatualizado até um refresh.
  useEffect(() => {
    let active = true;

    const load = () =>
      learningService
        .notifications(true, 1, 1)
        .then((page) => {
          if (active) setUnread(page.meta.total);
        })
        .catch(() => {
          // O sino é acessório: falhar aqui não pode quebrar a navegação.
        });

    void load();
    window.addEventListener(NOTIFICATIONS_CHANGED, load);

    return () => {
      active = false;
      window.removeEventListener(NOTIFICATIONS_CHANGED, load);
    };
  }, [pathname]);

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `Notificações, ${unread} não lidas` : 'Notificações'}
      className="relative grid size-10 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-brand-500"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5.5" aria-hidden="true">
        <path
          d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu mobile ao navegar.
  useEffect(() => setMobileOpen(false), [pathname]);

  const links = user ? LINKS_BY_ROLE[user.role] : GUEST_LINKS;
  const logo = logoFor(user?.role);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={isAuthenticated ? links[0]!.href : '/'} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático da marca */}
          <img src={logo.full} alt="Educagil" className="hidden h-8 w-auto sm:block" />
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático da marca */}
          <img src={logo.mini} alt="Educagil" className="h-8 w-auto sm:hidden" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                isActive(link.href)
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="size-10 animate-pulse rounded-full bg-surface-muted" />
          ) : isAuthenticated && user ? (
            <>
              <NotificationBell />

              <Dropdown
                label="Menu da conta"
                trigger={() => (
                  <span className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-muted">
                    <Avatar name={user.name} src={user.avatar_url} size="sm" />
                    <span className="hidden max-w-32 truncate text-sm font-semibold text-ink lg:block">
                      {user.name}
                    </span>
                  </span>
                )}
              >
                <div className="border-b border-border-subtle px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  <p className="mt-1 text-xs font-medium text-brand-500">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>

                <Link href="/profile" className="block">
                  <DropdownItem>Meu perfil</DropdownItem>
                </Link>
                <Link href="/settings" className="block">
                  <DropdownItem>Configurações</DropdownItem>
                </Link>

                <DropdownDivider />

                <DropdownItem tone="danger" onClick={() => void signOut()}>
                  Sair
                </DropdownItem>
              </Dropdown>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink href="/login" variant="ghost" size="sm">
                Entrar
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Criar conta
              </ButtonLink>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
              <path
                d={mobileOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Menu" className="border-t border-border-subtle bg-surface md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive(link.href)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-muted hover:bg-surface-muted',
                )}
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="mt-2 flex flex-col gap-2 border-t border-border-subtle pt-3">
                <ButtonLink href="/login" variant="outline" fullWidth>
                  Entrar
                </ButtonLink>
                <ButtonLink href="/register" fullWidth>
                  Criar conta
                </ButtonLink>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
