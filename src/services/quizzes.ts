import { del, get, post, put } from '@/lib/http';
import type { AttemptResult, Quiz, QuizPayload, StudentQuiz } from '@/types/api';

export const quizService = {
  // --- Aluno ----------------------------------------------------------------

  /** Quiz sem gabarito, com o resumo das tentativas do aluno. */
  forStudent: (lessonId: string) => get<StudentQuiz>(`/lessons/${lessonId}/quiz`),

  /** `answers`: question_id -> option_id. */
  submit: (lessonId: string, answers: Record<string, string>) =>
    post<AttemptResult>(`/lessons/${lessonId}/quiz/attempts`, { answers }),

  // --- Professor ------------------------------------------------------------

  /** Quiz com gabarito. 404 quando a aula ainda não tem quiz. */
  forAuthor: (lessonId: string) => get<Quiz>(`/lessons/${lessonId}/quiz/manage`),

  /** Cria ou substitui o quiz inteiro. */
  save: (lessonId: string, payload: QuizPayload) => put<Quiz>(`/lessons/${lessonId}/quiz`, payload),

  remove: (lessonId: string) => del(`/lessons/${lessonId}/quiz`),
};
