'use client';

import { useState } from 'react';
import { LuCircleCheck, LuCircleX, LuRotateCcw } from 'react-icons/lu';

import { quizService } from '@/services/quizzes';
import { useAsync } from '@/lib/useAsync';
import { ApiError } from '@/lib/http';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Display';
import { Alert, EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';
import type { AttemptResult, Certificate, Enrollment, Quiz } from '@/types/api';

interface QuizRunnerProps {
  lessonId: string;
  onPassed: (enrollment: Enrollment | null, certificate: Certificate | null) => void;
}

function ResultBanner({ result, quiz }: { result: AttemptResult; quiz: Quiz }) {
  const { attempt } = result;

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between',
        attempt.passed ? 'border-success/40 bg-success/5' : 'border-danger/30 bg-danger/5',
      )}
    >
      <div className="flex items-center gap-3">
        {attempt.passed ? (
          <LuCircleCheck className="size-8 shrink-0 text-success" aria-hidden="true" />
        ) : (
          <LuCircleX className="size-8 shrink-0 text-danger" aria-hidden="true" />
        )}
        <div>
          <p className="text-lg font-bold text-ink">
            {attempt.passed ? 'Aprovado!' : 'Não foi desta vez'}
          </p>
          <p className="text-sm text-ink-muted">
            Você acertou {result.correct_answers} de {result.total_questions} questões. Nota mínima: {quiz.passing_score}%.
          </p>
        </div>
      </div>
      <p className={cn('text-3xl font-bold', attempt.passed ? 'text-success' : 'text-danger')}>{attempt.score}%</p>
    </div>
  );
}

/**
 * Resolução do quiz pelo aluno: responde, envia, vê a correção e, se ainda
 * tiver tentativas, pode refazer. A aprovação conclui a aula no backend.
 */
export function QuizRunner({ lessonId, onPassed }: QuizRunnerProps) {
  const toast = useToast();
  const state = useAsync(() => quizService.forStudent(lessonId), [lessonId]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (state.error?.isNotFound) {
    return (
      <EmptyState
        title="Quiz em preparação"
        description="O professor ainda não publicou as questões desta avaliação. Você pode seguir para a próxima aula."
      />
    );
  }

  if (state.error || !state.data) {
    return <ErrorState title="Não foi possível carregar o quiz" onRetry={state.reload} />;
  }

  const view = state.data;
  const { quiz } = view;
  const answeredAll = quiz.questions.every((question) => answers[question.id]);
  const resultsByQuestion = new Map(result?.results.map((item) => [item.question_id, item]));
  const attemptsLeft = result ? result.attempts_left : view.attempts_left;
  const canRetry = attemptsLeft === null || attemptsLeft > 0;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await quizService.submit(lessonId, answers);
      setResult(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (response.attempt.passed) {
        toast.success('Quiz concluído com aprovação!');
        onPassed(response.enrollment, response.certificate);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar suas respostas.');
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    state.reload();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-ink">{quiz.title}</h2>
        {quiz.description && <p className="text-ink-muted">{quiz.description}</p>}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge>{quiz.questions.length} questões</Badge>
          <Badge>Nota mínima {quiz.passing_score}%</Badge>
          <Badge>
            {quiz.max_attempts === 0
              ? 'Tentativas ilimitadas'
              : `${attemptsLeft ?? 0} de ${quiz.max_attempts} tentativas restantes`}
          </Badge>
          {view.passed && <Badge tone="success">Você já foi aprovado</Badge>}
        </div>
      </header>

      {result && <ResultBanner result={result} quiz={quiz} />}

      {!result && !view.can_attempt && (
        <Alert tone="warning">
          Você usou todas as tentativas deste quiz.
          {view.best_score !== null && ` Sua melhor nota foi ${view.best_score}%.`}
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      <ol className="flex flex-col gap-5">
        {quiz.questions.map((question, index) => {
          const graded = resultsByQuestion.get(question.id);

          return (
            <li key={question.id} className="rounded-xl border border-border-subtle p-5">
              <fieldset disabled={Boolean(result) || !view.can_attempt}>
                <legend className="mb-4 flex gap-2 font-semibold text-ink">
                  <span className="text-brand-500">{index + 1}.</span>
                  <span className="whitespace-pre-line">{question.statement}</span>
                </legend>

                <div className="flex flex-col gap-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    const isCorrect = graded?.correct_option_id === option.id;
                    const isWrongPick = graded && graded.selected_option_id === option.id && !graded.correct;

                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                          'has-[:disabled]:cursor-default',
                          selected ? 'border-brand-400 bg-brand-50' : 'border-border-subtle hover:border-brand-200',
                          isCorrect && 'border-success bg-success/5',
                          isWrongPick && 'border-danger bg-danger/5',
                        )}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={selected}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                          className="size-4 accent-brand-400"
                        />
                        <span className="flex-1 text-ink">{option.text}</span>
                        {isCorrect && <LuCircleCheck className="size-4 text-success" aria-label="Resposta correta" />}
                        {isWrongPick && <LuCircleX className="size-4 text-danger" aria-label="Sua resposta, incorreta" />}
                      </label>
                    );
                  })}
                </div>

                {graded && !graded.correct && !graded.correct_option_id && (
                  <p className="mt-3 text-sm text-danger">Resposta incorreta.</p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        {!result && view.can_attempt && (
          <Button size="lg" onClick={submit} loading={submitting} disabled={!answeredAll}>
            Enviar respostas
          </Button>
        )}
        {!result && view.can_attempt && !answeredAll && (
          <span className="text-sm text-ink-muted">Responda todas as questões para enviar.</span>
        )}
        {result && !result.attempt.passed && canRetry && (
          <Button size="lg" variant="outline" onClick={retry} leftIcon={<LuRotateCcw aria-hidden="true" />}>
            Tentar novamente
          </Button>
        )}
      </div>

      {view.attempts.length > 0 && !result && (
        <section aria-labelledby="attempts-title" className="flex flex-col gap-2">
          <h3 id="attempts-title" className="font-semibold text-ink">
            Suas tentativas
          </h3>
          <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle text-sm">
            {view.attempts.map((attempt) => (
              <li key={attempt.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-ink-muted">{formatDate(attempt.submitted_at)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{attempt.score}%</span>
                  <Badge tone={attempt.passed ? 'success' : 'danger'}>{attempt.passed ? 'Aprovado' : 'Reprovado'}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
