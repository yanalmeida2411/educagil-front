'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { LuCornerDownRight, LuMessageSquare, LuTrash2 } from 'react-icons/lu';

import { learningService } from '@/services/learning';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { formatRelative, ROLE_LABELS } from '@/lib/format';
import { Avatar, Badge } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import { ErrorState, Skeleton } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { Comment } from '@/types/api';

function CommentForm({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  placeholder: string;
  submitLabel: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        aria-label={placeholder}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        value={content}
        autoFocus={autoFocus}
        onChange={(event) => setContent(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={sending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm" loading={sending} disabled={!content.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Discussão da aula: threads de um nível. O autor do comentário, o professor
 * do curso e o admin podem remover; o backend é quem decide de fato.
 */
export function LessonComments({ lessonId, teacherId }: { lessonId: string; teacherId: string }) {
  const toast = useToast();
  const { user } = useAuth();
  const threads = useAsync(() => learningService.comments(lessonId, 1, 50), [lessonId]);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canModerate = (comment: Comment) =>
    Boolean(user) && (comment.user_id === user?.id || user?.id === teacherId || user?.role === 'ADMIN');

  async function create(content: string, parentId?: string) {
    try {
      await learningService.createComment(lessonId, content, parentId);
      setReplyingTo(null);
      threads.reload();
      toast.success(parentId ? 'Resposta publicada.' : 'Comentário publicado.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível publicar.');
      throw err;
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await learningService.removeComment(pendingDelete.id);
      toast.info('Comentário removido.');
      setPendingDelete(null);
      threads.reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível remover.');
    } finally {
      setDeleting(false);
    }
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const author = comment.user;
    const isTeacher = comment.user_id === teacherId;

    return (
      <div className="flex gap-3">
        {isReply && <LuCornerDownRight className="mt-2 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />}
        <Avatar name={author?.name ?? 'Usuário'} src={author?.avatar_url} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink">{author?.name ?? 'Usuário'}</span>
            {isTeacher ? (
              <Badge tone="brand">Professor</Badge>
            ) : (
              author?.role === 'ADMIN' && <Badge>{ROLE_LABELS.ADMIN}</Badge>
            )}
            <span className="text-xs text-ink-muted">{formatRelative(comment.created_at)}</span>
          </div>
          <p className="whitespace-pre-line break-words text-sm text-ink">{comment.content}</p>
          <div className="flex gap-3">
            {!isReply && user && (
              <button
                type="button"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="cursor-pointer text-xs font-semibold text-brand-500 hover:underline"
              >
                Responder
              </button>
            )}
            {canModerate(comment) && (
              <button
                type="button"
                onClick={() => setPendingDelete(comment)}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-ink-muted hover:text-danger"
              >
                <LuTrash2 className="size-3" aria-hidden="true" /> Remover
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const items = threads.data?.items ?? [];

  return (
    <section aria-labelledby="comments-title" className="flex flex-col gap-5">
      <h2 id="comments-title" className="flex items-center gap-2 text-lg font-bold text-ink">
        <LuMessageSquare aria-hidden="true" /> Discussão
        {threads.data && <span className="text-sm font-normal text-ink-muted">({threads.data.meta.total})</span>}
      </h2>

      <CommentForm placeholder="Tire uma dúvida ou compartilhe algo sobre esta aula" submitLabel="Comentar" onSubmit={(content) => create(content)} />

      {threads.loading && items.length === 0 ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : threads.error ? (
        <ErrorState title="Não foi possível carregar a discussão" onRetry={threads.reload} />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted">Ninguém comentou ainda. Que tal começar a conversa?</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {items.map((thread) => (
            <li key={thread.id} className="flex flex-col gap-3">
              {renderComment(thread)}

              {(thread.replies ?? []).length > 0 && (
                <ul className="ml-6 flex flex-col gap-3 border-l border-border-subtle pl-4">
                  {(thread.replies ?? []).map((reply) => (
                    <li key={reply.id}>{renderComment(reply, true)}</li>
                  ))}
                </ul>
              )}

              {replyingTo === thread.id && (
                <div className="ml-11">
                  <CommentForm
                    autoFocus
                    placeholder={`Responder a ${thread.user?.name ?? 'comentário'}`}
                    submitLabel="Responder"
                    onSubmit={(content) => create(content, thread.id)}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Remover comentário?"
        description="As respostas desta conversa também serão removidas. Esta ação não pode ser desfeita."
        confirmLabel="Remover"
      />
    </section>
  );
}
