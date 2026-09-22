/**
 * Contrato da API Go (/api/v1).
 *
 * Os nomes seguem snake_case porque é o que o backend serializa — converter
 * para camelCase no client criaria um segundo vocabulário para o mesmo dado
 * e obrigaria a traduzir ida e volta em cada chamada.
 */

// --- Envelope ---------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Envelope<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  /** Presente em erros de validação: campo -> mensagem. */
  fields?: Record<string, string>;
}

/** Página de resultados já desembrulhada para uso nos componentes. */
export interface Page<T> {
  items: T[];
  meta: PaginationMeta;
}

// --- Enums ------------------------------------------------------------------

export const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const LESSON_TYPES = ['VIDEO', 'TEXT', 'PDF', 'QUIZ'] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'ENROLLMENT'
  | 'COURSE_COMPLETED'
  | 'CERTIFICATE'
  | 'COMMENT_REPLY'
  | 'COURSE_PUBLISHED'
  | 'COURSE_REVIEW'
  | 'SYSTEM';

// --- Entidades --------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatar_url: string | null;
  bio: string | null;
  headline: string | null;
  specialties: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  courses_count: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  teacher_id: string;
  level: CourseLevel;
  status: CourseStatus;
  thumbnail_url: string | null;
  objectives: string[] | null;
  requirements: string[] | null;
  is_free: boolean;
  published_at: string | null;
  /** Motivo da última reprovação pelo admin. */
  review_note: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;

  category?: Category;
  teacher?: User;

  // Agregados calculados pelo backend.
  lessons_count: number;
  duration_seconds: number;
  students_count: number;
  rating_average: number;
  rating_count: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: string | null;
  video_url: string | null;
  material_url: string | null;
  duration_seconds: number;
  position: number;
  is_required: boolean;
  /** Preenchido apenas nas rotas autenticadas do player. */
  completed?: boolean;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  lessons?: Lesson[];
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  last_lesson_id: string | null;
  enrolled_at: string;
  completed_at: string | null;
  updated_at: string;
  course?: Course;
  student?: User;
}

export interface Review {
  id: string;
  student_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  student?: User;
}

export interface Favorite {
  id: string;
  student_id: string;
  course_id: string;
  created_at: string;
  course?: Course;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_code: string;
  issued_at: string;
  course?: Course;
  student?: User;
}

export interface CertificateVerification {
  valid: boolean;
  certificate_code: string;
  student_name: string;
  course_title: string;
  issued_at: string;
}

export interface Comment {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}

// --- Quizzes ----------------------------------------------------------------

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  /** Presente apenas na visão do autor — o aluno nunca recebe o gabarito. */
  is_correct?: boolean;
  position: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  statement: string;
  points: number;
  position: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  /** 0 = ilimitado. */
  max_attempts: number;
  questions_count: number;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  submitted_at: string;
}

export interface StudentQuiz {
  quiz: Quiz;
  attempts_used: number;
  attempts_left: number | null;
  best_score: number | null;
  passed: boolean;
  can_attempt: boolean;
  attempts: QuizAttempt[];
}

export interface AnswerResult {
  question_id: string;
  selected_option_id: string | null;
  /** Revelado só após aprovação ou tentativas esgotadas. */
  correct_option_id: string | null;
  correct: boolean;
}

export interface AttemptResult {
  attempt: QuizAttempt;
  correct_answers: number;
  total_questions: number;
  results: AnswerResult[];
  attempts_left: number | null;
  enrollment: Enrollment | null;
  certificate: Certificate | null;
}

export interface QuizPayload {
  title: string;
  description?: string | null;
  passing_score: number;
  max_attempts: number;
  questions: Array<{
    statement: string;
    points: number;
    options: Array<{ text: string; is_correct: boolean }>;
  }>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  read: boolean;
  created_at: string;
}

// --- Payloads de resposta compostos -----------------------------------------

export interface Session {
  access: string;
  refresh: string;
  expires_at: string;
  user: User;
}

export interface CourseDetail {
  course: Course;
  modules: CourseModule[];
}

export interface CourseProgress {
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  completed_lessons: number;
  required_lessons: number;
  last_lesson_id: string | null;
  completed_at: string | null;
  completed_lesson_map: Record<string, boolean>;
}

export interface PlayerPayload {
  course: Course;
  modules: CourseModule[];
  enrollment: Enrollment;
  progress: Record<string, boolean>;
  /** Maior posição alcançada em cada aula, em segundos. */
  watched_seconds: Record<string, number>;
  next_lesson: Lesson | null;
}

export interface ActivityItem {
  lesson_id: string;
  lesson_title: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  completed_at: string;
}

export interface StudentDashboard {
  enrolled_courses: number;
  in_progress: number;
  completed: number;
  certificates: number;
  studied_hours: number;
  overall_progress: number;
  continue_learning: Enrollment[];
  recent_activity: ActivityItem[];
}

export interface TeacherDashboard {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  pending_courses: number;
  total_students: number;
  rating_average: number;
  completion_rate: number;
  courses: Course[];
}

export interface AdminDashboard {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  pending_courses: number;
  archived_courses: number;
  total_enrollments: number;
  completed_courses: number;
  total_certificates: number;
}

export interface TeacherProfile {
  teacher: User;
  courses: Course[];
  students_count: number;
  rating_average: number;
  courses_count: number;
}

// --- Payloads de requisição -------------------------------------------------

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, 'ADMIN'>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name: string;
  bio?: string | null;
  headline?: string | null;
  avatar_url?: string | null;
  specialties?: string[];
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface CoursePayload {
  title: string;
  short_description: string;
  description: string;
  category_id: string;
  level: CourseLevel;
  thumbnail_url?: string | null;
  objectives?: string[];
  requirements?: string[];
}

export interface ModulePayload {
  title: string;
  description?: string | null;
}

export interface LessonPayload {
  title: string;
  description?: string | null;
  type: LessonType;
  content?: string | null;
  video_url?: string | null;
  material_url?: string | null;
  duration_seconds: number;
  is_required?: boolean;
}

export interface CourseQuery {
  search?: string;
  category?: string;
  level?: CourseLevel | '';
  status?: CourseStatus | '';
  rating?: number;
  sort?: 'recent' | 'popular' | 'rating' | 'title';
  page?: number;
  limit?: number;
}
