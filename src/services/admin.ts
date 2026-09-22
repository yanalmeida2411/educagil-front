import { del, get, getPage, patch, post, put, send } from '@/lib/http';
import type {
  AdminDashboard,
  Category,
  Course,
  CourseQuery,
  Page,
  Role,
  User,
  UserStatus,
} from '@/types/api';

export interface AdminUserQuery {
  search?: string;
  role?: Role | '';
  status?: UserStatus | '';
  page?: number;
  limit?: number;
}

export interface CategoryPayload {
  name: string;
  description?: string | null;
  icon?: string | null;
}

function clean(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  );
}

export const adminService = {
  dashboard: () => get<AdminDashboard>('/admin/dashboard'),

  users: (query: AdminUserQuery = {}): Promise<Page<User>> =>
    getPage<User>('/admin/users', clean({ ...query })),

  setUserStatus: (userId: string, status: UserStatus) =>
    send('patch', `/admin/users/${userId}/status`, { status }),

  setUserRole: (userId: string, role: Role) =>
    send('patch', `/admin/users/${userId}/role`, { role }),

  /** Lista cursos em qualquer status, ao contrário do catálogo público. */
  courses: (query: CourseQuery = {}): Promise<Page<Course>> =>
    getPage<Course>('/admin/courses', clean({ ...query })),

  /** Reprovar exige `note`: é o que orienta o professor a corrigir. */
  reviewCourse: (courseId: string, approve: boolean, note?: string) =>
    patch<Course>(`/admin/courses/${courseId}/review`, { approve, note: note || null }),

  createCategory: (payload: CategoryPayload) => post<Category>('/admin/categories', payload),

  updateCategory: (id: string, payload: CategoryPayload) =>
    put<Category>(`/admin/categories/${id}`, payload),

  removeCategory: (id: string) => del(`/admin/categories/${id}`),
};
