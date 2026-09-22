'use client';

import { useEffect, useState } from 'react';
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2 } from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Alert, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { quizService } from '@/services/quizzes';
import { ApiError } from '@/lib/http';
import { cn } from '@/lib/cn';
import type { Lesson, Quiz, QuizPayload } from '@/types/api';

interface DraftOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

interface DraftQuestion {
  key: string;
  statement: string;
  points: number;
  options: DraftOption[];
}

let keySeed = 0;
const nextKey = () => `draft-${++keySeed}`;

const blankQuestion = (): DraftQuestion => ({
  key: nextKey(),
  statement: '',
  points: 1,
  options: [
    { key: nextKey(), text: '', isCorrect: true },
    { key: nextKey(), text: '', isCorrect: false },
  ],
});

function fromQuiz(quiz: Quiz): DraftQuestion[] {
  return quiz.questions.map((question) => ({
    key: nextKey(),
    statement: question.statement,
    points: question.points,
    options: question.options.map((option) => ({
      key: nextKey(),
      text: option.text,
      isCorrect: Boolean(option.is_correct),
    })),
  }));
}

/** Espelha as regras do QuizService no backend para apontar o erro antes de salvar. */
function validateDraft(title: string, questions: DraftQuestion[]): string | null {
  if (title.trim().length < 3) return 'O título do quiz deve ter ao menos 3 caracteres.';
  if (questions.length === 0) return 'Adicione ao menos uma questão.';

  for (const [index, question] of questions.entries()) {
    const n = index + 1;
    if (!question.statement.trim()) return `A questão ${n} está sem enunciado.`;
    if (question.options.length < 2) return `A questão ${n} precisa de ao menos 2 alternativas.`;
    if (question.options.some((option) => !option.text.trim())) return `A questão ${n} tem uma alternativa vazia.`;
    if (question.options.filter((option) => option.isCorrect).length !== 1) {
      return `Marque exatamente uma alternativa correta na questão ${n}.`;
    }
  }
  return null;
}

export function QuizEditorModal({ lesson, onClose }: { lesson: Lesson | null; onClose: () => void }) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!lesson) return;

    let active = true;
    setLoading(true);
    setLoadError(null);
    setError(null);

    quizService
      .forAuthor(lesson.id)
      .then((quiz) => {
        if (!active) return;
        setExists(true);
        setTitle(quiz.title);
        setDescription(quiz.description ?? '');
        setPassingScore(String(quiz.passing_score));
        setMaxAttempts(String(quiz.max_attempts));
        setQuestions(fromQuiz(quiz));
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.isNotFound) {
          // Aula de quiz ainda sem questões: começa um quiz em branco.
          setExists(false);
          setTitle(lesson.title);
          setDescription('');
          setPassingScore('70');
          setMaxAttempts('3');
          setQuestions([blankQuestion()]);
        } else {
          setLoadError(err instanceof ApiError ? err.message : 'Não foi possível carregar o quiz.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lesson]);

  const updateQuestion = (key: string, change: Partial<DraftQuestion>) =>
    setQuestions((current) => current.map((question) => (question.key === key ? { ...question, ...change } : question)));

  const moveQuestion = (index: number, direction: -1 | 1) =>
    setQuestions((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target]!, copy[index]!];
      return copy;
    });

  async function save() {
    if (!lesson) return;

    const problem = validateDraft(title, questions);
    if (problem) {
      setError(problem);
      return;
    }

    const payload: QuizPayload = {
      title: title.trim(),
      description: description.trim() || null,
      passing_score: Math.min(100, Math.max(0, Number(passingScore) || 0)),
      max_attempts: Math.min(20, Math.max(0, Number(maxAttempts) || 0)),
      questions: questions.map((question) => ({
        statement: question.statement.trim(),
        points: Math.min(100, Math.max(1, question.points)),
        options: question.options.map((option) => ({ text: option.text.trim(), is_correct: option.isCorrect })),
      })),
    };

    setSaving(true);
    setError(null);
    try {
      await quizService.save(lesson.id, payload);
      toast.success('Quiz salvo.');
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!lesson) return;
    setDeleting(true);
    try {
      await quizService.remove(lesson.id);
      toast.info('Quiz removido.');
      setConfirmDelete(false);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível remover o quiz.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open={lesson !== null}
      onClose={onClose}
      dismissible={!saving}
      size="xl"
      title={exists ? 'Editar quiz' : 'Criar quiz'}
      description={lesson ? `Aula: ${lesson.title}` : undefined}
      footer={
        !loading &&
        !loadError && (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            {exists ? (
              <Button variant="ghost" className="text-danger" onClick={() => setConfirmDelete(true)} leftIcon={<LuTrash2 aria-hidden="true" />}>
                Excluir quiz
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={save} loading={saving}>
                Salvar quiz
              </Button>
            </div>
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : loadError ? (
        <ErrorState title={loadError} />
      ) : (
        <div className="flex flex-col gap-6">
          {error && <Alert tone="error">{error}</Alert>}

          <div className="grid gap-4 sm:grid-cols-[1fr_9rem_9rem]">
            <Input label="Título do quiz" required value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} />
            <Input
              label="Nota mínima (%)"
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(event) => setPassingScore(event.target.value)}
            />
            <Input
              label="Tentativas"
              type="number"
              min={0}
              max={20}
              value={maxAttempts}
              hint="0 = ilimitadas"
              onChange={(event) => setMaxAttempts(event.target.value)}
            />
          </div>

          <Textarea
            label="Instruções (opcional)"
            rows={2}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <ol className="flex flex-col gap-4">
            {questions.map((question, index) => (
              <li key={question.key} className="flex flex-col gap-3 rounded-xl border border-border-subtle p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-500">Questão {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" aria-label="Mover questão para cima" disabled={index === 0} onClick={() => moveQuestion(index, -1)}>
                      <LuArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Mover questão para baixo"
                      disabled={index === questions.length - 1}
                      onClick={() => moveQuestion(index, 1)}
                    >
                      <LuArrowDown aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remover questão ${index + 1}`}
                      disabled={questions.length === 1}
                      onClick={() => setQuestions((current) => current.filter((item) => item.key !== question.key))}
                    >
                      <LuTrash2 aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  <Textarea
                    label="Enunciado"
                    rows={2}
                    maxLength={2000}
                    value={question.statement}
                    onChange={(event) => updateQuestion(question.key, { statement: event.target.value })}
                  />
                  <Input
                    label="Pontos"
                    type="number"
                    min={1}
                    max={100}
                    value={question.points}
                    onChange={(event) => updateQuestion(question.key, { points: Number(event.target.value) || 1 })}
                  />
                </div>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-semibold text-ink-muted">
                    Alternativas <span className="font-normal">(marque a correta)</span>
                  </legend>

                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.key}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-1.5',
                        option.isCorrect ? 'border-success bg-success/5' : 'border-border-subtle',
                      )}
                    >
                      <input
                        type="radio"
                        name={`correct-${question.key}`}
                        aria-label={`Alternativa ${optionIndex + 1} é a correta`}
                        checked={option.isCorrect}
                        onChange={() =>
                          updateQuestion(question.key, {
                            options: question.options.map((item) => ({ ...item, isCorrect: item.key === option.key })),
                          })
                        }
                        className="size-4 accent-success"
                      />
                      <input
                        aria-label={`Texto da alternativa ${optionIndex + 1}`}
                        value={option.text}
                        maxLength={500}
                        placeholder={`Alternativa ${optionIndex + 1}`}
                        onChange={(event) =>
                          updateQuestion(question.key, {
                            options: question.options.map((item) =>
                              item.key === option.key ? { ...item, text: event.target.value } : item,
                            ),
                          })
                        }
                        className="h-9 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle"
                      />
                      <button
                        type="button"
                        aria-label={`Remover alternativa ${optionIndex + 1}`}
                        disabled={question.options.length <= 2}
                        onClick={() => {
                          const remaining = question.options.filter((item) => item.key !== option.key);
                          // Se a correta foi removida, a primeira restante assume.
                          if (option.isCorrect && remaining[0]) remaining[0] = { ...remaining[0], isCorrect: true };
                          updateQuestion(question.key, { options: remaining });
                        }}
                        className="cursor-pointer rounded p-1 text-ink-muted hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <LuTrash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}

                  {question.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(question.key, {
                          options: [...question.options, { key: nextKey(), text: '', isCorrect: false }],
                        })
                      }
                      className="inline-flex w-fit cursor-pointer items-center gap-1 text-sm font-semibold text-brand-500 hover:underline"
                    >
                      <LuPlus className="size-4" aria-hidden="true" /> Adicionar alternativa
                    </button>
                  )}
                </fieldset>
              </li>
            ))}
          </ol>

          {questions.length < 50 && (
            <Button variant="outline" onClick={() => setQuestions((current) => [...current, blankQuestion()])} leftIcon={<LuPlus aria-hidden="true" />}>
              Adicionar questão
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={deleting}
        title="Excluir quiz?"
        description="As questões e o histórico de tentativas dos alunos serão apagados. A aula continua existindo."
        confirmLabel="Excluir quiz"
      />
    </Modal>
  );
}
