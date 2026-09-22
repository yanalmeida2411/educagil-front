import { del, get, getPage, patch, post, put, send } from '@/lib/http';
import type {
  Category,
  Course,
  CourseDetail,
  CoursePayload,
  CourseQuery,
  CourseStatus,
  Lesson,
  LessonPayload,
  CourseModule,
  ModulePayload,
  Page,
  Review,
  TeacherProfile,
} from '@/types/api';

/** Remove chaves vazias para não enviar `?level=&search=` na query string. */
function cleanQuery(query: CourseQuery = {}): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== 0),
  );
}

export const courseService = {
  // --- Catálogo -------------------------------------------------------------

  list: (query: CourseQuery = {}): Promise<Page<Course>> =>
    getPage<Course>('/courses', cleanQuery(query)),

  /** Aceita id ou slug — o backend resolve os dois. */
  detail: (idOrSlug: string) => get<CourseDetail>(`/courses/${idOrSlug}`),

  categories: () => get<Category[]>('/categories'),

  teacherProfile: (teacherId: string) => get<TeacherProfile>(`/teachers/${teacherId}`),

  reviews: (courseId: string, page = 1, limit = 10): Promise<Page<Review>> =>
    getPage<Review>(`/courses/${courseId}/reviews`, { page, limit }),

  // --- Autoria --------------------------------------------------------------

  create: (payload: CoursePayload) => post<Course>('/courses', payload),

  update: (courseId: string, payload: CoursePayload) =>
    put<Course>(`/courses/${courseId}`, payload),

  setStatus: (courseId: string, status: CourseStatus) =>
    patch<Course>(`/courses/${courseId}/publish`, { status }),

  remove: (courseId: string) => del(`/courses/${courseId}`),

  // --- Módulos --------------------------------------------------------------

  modules: (courseId: string) => get<CourseModule[]>(`/courses/${courseId}/modules`),

  createModule: (courseId: string, payload: ModulePayload) =>
    post<CourseModule>(`/courses/${courseId}/modules`, payload),

  updateModule: (moduleId: string, payload: ModulePayload) =>
    put<CourseModule>(`/modules/${moduleId}`, payload),

  removeModule: (moduleId: string) => del(`/modules/${moduleId}`),

  reorderModules: (courseId: string, ids: string[]) =>
    send('patch', `/courses/${courseId}/modules/reorder`, { ids }),

  // --- Aulas ----------------------------------------------------------------

  lessons: (moduleId: string) => get<Lesson[]>(`/modules/${moduleId}/lessons`),

  createLesson: (moduleId: string, payload: LessonPayload) =>
    post<Lesson>(`/modules/${moduleId}/lessons`, payload),

  updateLesson: (lessonId: string, payload: LessonPayload) =>
    put<Lesson>(`/lessons/${lessonId}`, payload),

  removeLesson: (lessonId: string) => del(`/lessons/${lessonId}`),

  reorderLessons: (moduleId: string, ids: string[]) =>
    send('patch', `/modules/${moduleId}/lessons/reorder`, { ids }),
};
