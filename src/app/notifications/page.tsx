'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuAward,
  LuBell,
  LuBookOpen,
  LuCircleCheck,
  LuClipboardCheck,
  LuMessageSquare,
  LuSparkles,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';

import { AppShell, PageHeader } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Display';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { learningService } from '@/services/learning';
import { useAsync } from '@/lib/useAsync';
import { safeRedirect } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import { emitNotificationsChanged } from '@/lib/events';
import { formatRelative } from '@/lib/format';
import type { Notification, NotificationType } from '@/types/api';

const ICONS: Record<NotificationType, IconType> = {
  ENROLLMENT: LuBookOpen,
  COURSE_COMPLETED: LuCircleCheck,
  CERTIFICATE: LuAward,
  COMMENT_REPLY: LuMessageSquare,
  COURSE_PUBLISHED: LuSparkles,
  COURSE_REVIEW: LuClipboardCheck,
  SYSTEM: LuBell,
};

export default function NotificationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const list = useAsync(() => learningService.notifications(onlyUnread, page, 15), [onlyUnread, page]);

  const notifyNavbar = emitNotificationsChanged;

  async function open(notification: Notification) {
    if (!notification.read) {
      list.setData((current) =>
        current
          ? { ...current, items: current.items.map((item) => (item.id === notification.id ? { ...item, read: true } : item)) }
          : current,
      );
      learningService
        .markNotificationRead(notification.id)
        .then(notifyNavbar)
        .catch(() => undefined);
    }

    const target = safeRedirect(notification.link);
    if (target) router.push(target);
  }

  async function markAll() {
    setMarkingAll(true);
    try {
      await learningService.markAllNotificationsRead();
      notifyNavbar();
      toast.success('Todas as notificações foram marcadas como lidas.');
      list.reload();
    } catch {
      toast.error('Não foi possível atualizar as notificações.');
    } finally {
      setMarkingAll(false);
    }
  }

  const items = list.data?.items ?? [];
  const hasUnread = items.some((item) => !item.read);

  return (
    <AppShell>
      <PageHeader
        title="Notificações"
        description="Matrículas, conclusões, certificados e respostas em um só lugar."
        actions={
          <Button variant="outline" size="sm" onClick={markAll} loading={markingAll} disabled={!hasUnread}>
            Marcar todas como lidas
          </Button>
        }
      />

      <Tabs
        items={[
          { id: 'all', label: 'Todas' },
          { id: 'unread', label: 'Não lidas' },
        ]}
        active={onlyUnread ? 'unread' : 'all'}
        onChange={(id) => {
          setOnlyUnread(id === 'unread');
          setPage(1);
        }}
        className="mb-4"
      />

      {list.loading && items.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : list.error ? (
        <ErrorState title="Não foi possível carregar as notificações" onRetry={list.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<LuBell className="size-10" />}
          title={onlyUnread ? 'Nada novo por aqui' : 'Nenhuma notificação ainda'}
          description={onlyUnread ? 'Você já leu todas as suas notificações.' : 'Avisaremos quando algo importante acontecer.'}
        />
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle">
            {items.map((notification) => {
              const Icon = ICONS[notification.type] ?? LuBell;

              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => open(notification)}
                    className={cn(
                      'flex w-full cursor-pointer gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-muted/60',
                      !notification.read && 'bg-brand-50/60',
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className={cn('text-sm text-ink', !notification.read && 'font-semibold')}>
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="size-2 rounded-full bg-brand-400" aria-label="Não lida" role="img" />
                        )}
                      </span>
                      <span className="text-sm text-ink-muted">{notification.message}</span>
                      <span className="text-xs text-ink-subtle">{formatRelative(notification.created_at)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {list.data && (
            <Pagination className="mt-6" page={list.data.meta.page} totalPages={list.data.meta.totalPages} onChange={setPage} />
          )}
        </>
      )}
    </AppShell>
  );
}
