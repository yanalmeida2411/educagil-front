import { get, post, put, send } from '@/lib/http';
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  Session,
  UpdateProfilePayload,
  User,
} from '@/types/api';

export const authService = {
  register: (payload: RegisterPayload) => post<Session>('/auth/register', payload),

  login: (payload: LoginPayload) => post<Session>('/auth/login', payload),

  /** Revoga o refresh token no servidor. Falhar aqui não impede o logout local. */
  logout: (refresh: string) => send('post', '/auth/logout', { refresh }),

  /** `dev_reset_url` só vem fora de produção, substituindo o e-mail. */
  forgotPassword: (email: string) =>
    post<{ message: string; dev_reset_url?: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    send('post', '/auth/reset-password', { token, password }),

  me: () => get<User>('/users/me'),

  updateProfile: (payload: UpdateProfilePayload) => put<User>('/users/me', payload),

  /** Troca a senha e encerra as demais sessões do usuário. */
  changePassword: (payload: ChangePasswordPayload) =>
    send('put', '/users/me/password', payload),
};
