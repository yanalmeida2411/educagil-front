'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { learningService } from '@/services/learning';
import { courseService } from '@/services/courses';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { formatRating, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Avatar, Stars } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import { Alert, EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';
import type { Course, Review } from '@/types/api';

const PAGE_SIZE = 5;
/** Espelha a regra do backend: avaliar exige ter consumido parte do curso. */
const MIN_PROGRESS_TO_REVIEW = 20;

function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Sua nota" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
          onClick={() => onChange(star)}
          className="cursor-pointer rounded p-0.5"
        >
          <svg
            viewBox="0 0 20 20"
            className={cn('size-7 transition-colors', star <= value ? 'text-warning' : 'text-ink-subtle')}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.1l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  course,
  existing,
  onSaved,
}: {
  course: Course;
  existing: Review | null;
  onSaved: (review: Review) => void;
}) {
  const toast = useToast();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setError('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await learningService.submitReview(course.id, rating, comment.trim());
      onSaved(saved);
      toast.success(existing ? 'Avaliação atualizada.' : 'Obrigado pela avaliação!');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar a avaliação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border-subtle p-4">
      <h3 className="font-semibold text-ink">
        {existing ? 'Editar sua avaliação' : 'Avalie este curso'}
      </h3>
      {error && <Alert tone="error">{error}</Alert>}
      <StarPicker value={rating} onChange={setRating} />
      <Textarea
        label="Comentário (opcional)"
        placeholder="O que funcionou bem? O que poderia melhorar?"
        maxLength={2000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <Button type="submit" loading={saving} className="self-start">
        {existing ? 'Salvar alterações' : 'Publicar avaliação'}
      </Button>
    </form>
  );
}

/**
 * Avaliações do curso: média, lista paginada e, para o aluno matriculado com
 * progresso suficiente, o formulário para avaliar ou editar a própria nota.
 */
export function ReviewsSection({
  course,
  canReview,
  progress,
}: {
  course: Course;
  /** Aluno matriculado (ativo ou concluído). */
  canReview: boolean;
  progress: number;
}) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Review[]>([]);

  const list = useAsync(
    async () => {
      const result = await courseService.reviews(course.id, page, PAGE_SIZE);
      setItems((current) => (page === 1 ? result.items : [...current, ...result.items]));
      return result.meta;
    },
    [course.id, page],
  );

  const mine = useAsync(() => learningService.myReview(course.id), [course.id], {
    enabled: canReview,
  });

  const eligible = canReview && progress >= MIN_PROGRESS_TO_REVIEW;

  return (
    <section aria-labelledby="reviews-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="reviews-title" className="text-xl font-bold text-ink">
          Avaliações
        </h2>
        {course.rating_count > 0 && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="text-2xl font-bold text-ink">{formatRating(course.rating_average)}</span>
            <Stars value={course.rating_average} />
            <span>
              ({course.rating_count} {course.rating_count === 1 ? 'avaliação' : 'avaliações'})
            </span>
          </p>
        )}
      </div>

      {canReview && !eligible && (
        <Alert tone="info">
          Conclua ao menos {MIN_PROGRESS_TO_REVIEW}% do curso para deixar sua avaliação.
        </Alert>
      )}

      {eligible && !mine.loading && (
        <ReviewForm
          key={mine.data?.id ?? 'new'}
          course={course}
          existing={mine.data}
          onSaved={(review) => {
            mine.setData(review);
            setPage(1);
            list.reload();
          }}
        />
      )}

      {list.error && items.length === 0 ? (
        <ErrorState title="Não foi possível carregar as avaliações" onRetry={list.reload} />
      ) : list.loading && items.length === 0 ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Ainda sem avaliações"
          description="Quem concluir parte do curso poderá contar como foi a experiência."
        />
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border-subtle">
            {items.map((review) => (
              <li key={review.id} className="flex gap-3 py-4 first:pt-0">
                <Avatar name={review.student?.name ?? 'Aluno'} src={review.student?.avatar_url} />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-ink">{review.student?.name ?? 'Aluno'}</span>
                    <Stars value={review.rating} size="sm" />
                    <span className="text-xs text-ink-muted">{formatRelative(review.updated_at)}</span>
                  </div>
                  {review.comment && (
                    <p className="whitespace-pre-line text-sm text-ink-muted">{review.comment}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {list.data && page < list.data.totalPages && (
            <Button
              variant="outline"
              className="self-center"
              loading={list.loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Ver mais avaliações
            </Button>
          )}
        </>
      )}
    </section>
  );
}
