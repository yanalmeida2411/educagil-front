import { del, get, getPage, post, send } from '@/lib/http';
import type {
  Certificate,
  CertificateVerification,
  Comment,
  Course,
  CourseProgress,
  Enrollment,
  EnrollmentStatus,
  Favorite,
  Notification,
  Page,
  PlayerPayload,
  Review,
  StudentDashboard,
  TeacherDashboard,
} from '@/types/api';

export const learningService = {
  // --- Matrícula e progresso ------------------------------------------------

  enroll: (courseId: string) => post<Enrollment>(`/courses/${courseId}/enroll`, {}),

  cancelEnrollment: (courseId: string) => del(`/courses/${courseId}/enroll`),

  myCourses: (status?: EnrollmentStatus, page = 1, limit = 12): Promise<Page<Enrollment>> =>
    getPage<Enrollment>('/me/courses', { status: status ?? undefined, page, limit }),

  courseProgress: (courseId: string) => get<CourseProgress>(`/courses/${courseId}/progress`),

  /** Carrega curso, currículo e progresso numa chamada só. */
  player: (courseIdOrSlug: string) =>
    get<PlayerPayload>(`/me/courses/${courseIdOrSlug}/player`),

  completeLesson: (lessonId: string, watchedSeconds = 0) =>
    post<{ enrollment: Enrollment; certificate: Certificate | null }>(
      `/lessons/${lessonId}/complete`,
      { watched_seconds: watchedSeconds },
    ),

  /** Salva o tempo assistido sem concluir — usado para retomar de onde parou. */
  trackProgress: (lessonId: string, watchedSeconds: number) =>
    send('post', `/lessons/${lessonId}/progress`, { watched_seconds: watchedSeconds }),

  dashboard: () => get<StudentDashboard>('/me/dashboard'),

  // --- Favoritos ------------------------------------------------------------

  addFavorite: (courseId: string) => send('post', `/courses/${courseId}/favorite`),

  removeFavorite: (courseId: string) => del(`/courses/${courseId}/favorite`),

  favorites: (page = 1, limit = 12): Promise<Page<Favorite>> =>
    getPage<Favorite>('/me/favorites', { page, limit }),

  // --- Avaliações -----------------------------------------------------------

  submitReview: (courseId: string, rating: number, comment?: string | null) =>
    post<Review>(`/courses/${courseId}/reviews`, { rating, comment: comment || null }),

  /** Devolve `null` quando o aluno ainda não avaliou. */
  myReview: (courseId: string) => get<Review | null>(`/courses/${courseId}/reviews/me`),

  // --- Certificados ---------------------------------------------------------

  certificates: () => get<Certificate[]>('/me/certificates'),

  verifyCertificate: (code: string) =>
    get<CertificateVerification>(`/certificates/verify/${encodeURIComponent(code)}`),

  // --- Comentários ----------------------------------------------------------

  comments: (lessonId: string, page = 1, limit = 20): Promise<Page<Comment>> =>
    getPage<Comment>(`/lessons/${lessonId}/comments`, { page, limit }),

  createComment: (lessonId: string, content: string, parentId?: string) =>
    post<Comment>(`/lessons/${lessonId}/comments`, {
      content,
      parent_id: parentId ?? null,
    }),

  removeComment: (commentId: string) => del(`/comments/${commentId}`),

  // --- Notificações ---------------------------------------------------------

  notifications: (onlyUnread = false, page = 1, limit = 20) =>
    getPage<Notification>('/me/notifications', {
      unread: onlyUnread ? 'true' : undefined,
      page,
      limit,
    }),

  markNotificationRead: (id: string) => send('patch', `/me/notifications/${id}/read`),

  markAllNotificationsRead: () => send('patch', '/me/notifications/read-all'),
};

export const teacherService = {
  dashboard: () => get<TeacherDashboard>('/teacher/dashboard'),

  courses: (params: { search?: string; status?: string; page?: number; limit?: number } = {}) =>
    getPage<Course>('/teacher/courses', params),

  students: (courseId: string, page = 1, limit = 20): Promise<Page<Enrollment>> =>
    getPage<Enrollment>(`/teacher/courses/${courseId}/students`, { page, limit }),
};
