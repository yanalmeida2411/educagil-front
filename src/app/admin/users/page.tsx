'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { LuBan, LuCircleCheck, LuEllipsisVertical, LuSearch, LuUserCog } from 'react-icons/lu';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Avatar, Badge } from '@/components/ui/Display';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { Input, Select } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/Feedback';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/admin';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { formatDate, ROLE_LABELS, STATUS_LABELS } from '@/lib/format';
import { ROLES } from '@/types/api';
import type { Role, User, UserStatus } from '@/types/api';

const ROLE_TONES = { STUDENT: 'neutral', TEACHER: 'brand', ADMIN: 'warning' } as const;

type PendingAction = { kind: 'status'; user: User } | { kind: 'role'; user: User } | null;

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);

  const [pending, setPending] = useState<PendingAction>(null);
  const [nextRole, setNextRole] = useState<Role>('STUDENT');
  const [working, setWorking] = useState(false);

  const users = useAsync(
    () => adminService.users({ search: appliedSearch, role, status, page, limit: 15 }),
    [appliedSearch, role, status, page],
  );

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
  }

  function openRole(target: User) {
    setNextRole(target.role);
    setPending({ kind: 'role', user: target });
  }

  async function run() {
    if (!pending) return;
    setWorking(true);

    try {
      if (pending.kind === 'status') {
        const blocking = pending.user.status === 'ACTIVE';
        await adminService.setUserStatus(pending.user.id, blocking ? 'BLOCKED' : 'ACTIVE');
        toast.success(blocking ? 'Conta bloqueada e sessões encerradas.' : 'Conta reativada.');
      } else {
        await adminService.setUserRole(pending.user.id, nextRole);
        toast.success(`Papel alterado para ${ROLE_LABELS[nextRole]}. As sessões do usuário foram encerradas.`);
      }
      setPending(null);
      users.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setWorking(false);
    }
  }

  const columns: Array<Column<User>> = [
    {
      key: 'user',
      header: 'Usuário',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={row.name} src={row.avatar_url} size="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-ink">
              {row.name}
              {row.id === me?.id && <span className="ml-1.5 text-xs font-normal text-ink-muted">(você)</span>}
            </span>
            <span className="truncate text-xs text-ink-muted">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Papel',
      render: (row) => <Badge tone={ROLE_TONES[row.role]}>{ROLE_LABELS[row.role]}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.status === 'ACTIVE' ? <Badge tone="success">Ativo</Badge> : <Badge tone="danger">{STATUS_LABELS.BLOCKED}</Badge>,
    },
    {
      key: 'created',
      header: 'Cadastro',
      hideOnMobile: true,
      render: (row) => <span className="text-ink-muted">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Ações</span>,
      align: 'right',
      // O backend recusa alterar a própria conta; esconder evita o clique inútil.
      render: (row) =>
        row.id === me?.id ? null : (
          <Dropdown
            label={`Ações para ${row.name}`}
            trigger={() => (
              <span className="grid size-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink">
                <LuEllipsisVertical className="size-5" aria-hidden="true" />
              </span>
            )}
          >
            <DropdownItem icon={<LuUserCog className="size-4" />} onClick={() => openRole(row)}>
              Alterar papel
            </DropdownItem>
            {row.status === 'ACTIVE' ? (
              <DropdownItem tone="danger" icon={<LuBan className="size-4" />} onClick={() => setPending({ kind: 'status', user: row })}>
                Bloquear
              </DropdownItem>
            ) : (
              <DropdownItem icon={<LuCircleCheck className="size-4" />} onClick={() => setPending({ kind: 'status', user: row })}>
                Reativar
              </DropdownItem>
            )}
          </Dropdown>
        ),
    },
  ];

  const blocking = pending?.kind === 'status' && pending.user.status === 'ACTIVE';

  return (
    <AppShell>
      <PageHeader title="Usuários" description="Gerencie contas, papéis e acessos da plataforma." />

      <form onSubmit={onSearch} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Buscar"
          placeholder="Nome ou e-mail"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<LuSearch className="size-4" />}
          containerClassName="flex-1"
        />
        <Select
          label="Papel"
          placeholder="Todos"
          value={role}
          onChange={(event) => {
            setRole(event.target.value as Role | '');
            setPage(1);
          }}
          options={ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))}
          containerClassName="sm:w-44"
        />
        <Select
          label="Status"
          placeholder="Todos"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as UserStatus | '');
            setPage(1);
          }}
          options={[
            { value: 'ACTIVE', label: 'Ativo' },
            { value: 'BLOCKED', label: STATUS_LABELS.BLOCKED },
          ]}
          containerClassName="sm:w-44"
        />
      </form>

      {users.error ? (
        <ErrorState title="Não foi possível carregar os usuários" onRetry={users.reload} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={users.data?.items ?? []}
            rowKey={(row) => row.id}
            loading={users.loading && !users.data}
            caption="Usuários da plataforma"
            emptyTitle="Nenhum usuário encontrado"
            emptyDescription="Ajuste a busca ou os filtros."
          />
          {users.data && (
            <Pagination
              className="mt-6"
              page={users.data.meta.page}
              totalPages={users.data.meta.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={pending?.kind === 'status'}
        onClose={() => setPending(null)}
        onConfirm={run}
        loading={working}
        destructive={blocking}
        title={blocking ? 'Bloquear conta?' : 'Reativar conta?'}
        description={
          blocking
            ? `${pending?.user.name} perde o acesso imediatamente e todas as sessões abertas são encerradas.`
            : `${pending?.user.name ?? 'O usuário'} volta a poder entrar na plataforma.`
        }
        confirmLabel={blocking ? 'Bloquear' : 'Reativar'}
      />

      <Modal
        open={pending?.kind === 'role'}
        onClose={() => setPending(null)}
        dismissible={!working}
        size="sm"
        title="Alterar papel"
        description={pending ? `${pending.user.name} · ${pending.user.email}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={working}>
              Cancelar
            </Button>
            <Button onClick={run} loading={working} disabled={pending?.kind === 'role' && nextRole === pending.user.role}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Select
            label="Novo papel"
            value={nextRole}
            onChange={(event) => setNextRole(event.target.value as Role)}
            options={ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))}
          />
          <p className="text-sm text-ink-muted">
            O papel vale para todas as permissões da conta. O usuário será desconectado e precisará entrar novamente.
          </p>
        </div>
      </Modal>
    </AppShell>
  );
}
