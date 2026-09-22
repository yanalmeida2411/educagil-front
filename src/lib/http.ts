import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { env } from './env';
import { clearSession, readSession, writeSession } from './session';
import type { ApiErrorBody, Envelope, Page } from '@/types/api';

/** Config acrescida do marcador de retentativa pós-refresh. */
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Erro normalizado da API. Carrega o código e os erros por campo para que
 * formulários possam destacar o input errado em vez de só mostrar um toast.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(message: string, code: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  /** `true` quando a sessão caiu e o usuário precisa entrar de novo. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** `true` quando há mensagens por campo para exibir no formulário. */
  get hasFieldErrors(): boolean {
    return Object.keys(this.fields).length > 0;
  }
}

/** Traduz qualquer falha de rede/HTTP num ApiError com mensagem exibível. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: ApiErrorBody }>;
    const body = axiosError.response?.data?.error;
    const status = axiosError.response?.status ?? 0;

    if (body) {
      return new ApiError(body.message, body.code, status, body.fields ?? {});
    }

    if (axiosError.response) {
      return new ApiError(
        'O servidor respondeu de forma inesperada. Tente novamente.',
        'UNEXPECTED_RESPONSE',
        status,
      );
    }

    return new ApiError(
      'Não foi possível falar com o servidor. Verifique sua conexão.',
      'NETWORK_ERROR',
      0,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 'UNKNOWN', 0);
  }

  return new ApiError('Erro desconhecido.', 'UNKNOWN', 0);
}

/** Disparado quando o refresh falha: a aplicação deve mandar para o login. */
type SessionExpiredListener = () => void;
let onSessionExpired: SessionExpiredListener | null = null;

export function setSessionExpiredHandler(listener: SessionExpiredListener | null): void {
  onSessionExpired = listener;
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiUrl,
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
  });

  // O token é resolvido a cada requisição, e não na criação do client, para
  // que uma renovação de sessão passe a valer imediatamente.
  client.interceptors.request.use((config) => {
    const session = readSession();
    if (session?.access) {
      config.headers.set('Authorization', `Bearer ${session.access}`);
    }
    return config;
  });

  let isRefreshing = false;
  let queue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

  const drainQueue = (error: unknown, token: string | null) => {
    queue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
    queue = [];
  };

  const failSession = (error: unknown) => {
    clearSession();
    onSessionExpired?.();
    return Promise.reject(error);
  };

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;

      if (error.response?.status !== 401 || !original || original._retry) {
        return Promise.reject(error);
      }

      // O próprio refresh devolvendo 401 significa sessão morta: tentar de
      // novo entraria em laço.
      if (original.url?.includes('/auth/refresh')) {
        return failSession(error);
      }

      // Um refresh já está em andamento: entra na fila e repete depois.
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.set('Authorization', `Bearer ${token}`);
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const session = readSession();
      if (!session?.refresh) {
        isRefreshing = false;
        return failSession(error);
      }

      try {
        // Chamada crua: passar pelo `client` reentraria neste interceptor.
        const { data } = await axios.post<Envelope<{ access: string; refresh: string }>>(
          `${env.apiUrl}/auth/refresh`,
          { refresh: session.refresh },
          { headers: { 'Content-Type': 'application/json' } },
        );

        writeSession({
          ...session,
          access: data.data.access,
          refresh: data.data.refresh,
        });

        original.headers.set('Authorization', `Bearer ${data.data.access}`);
        drainQueue(null, data.data.access);
        return client(original);
      } catch (refreshError) {
        drainQueue(refreshError, null);
        isRefreshing = false;
        return failSession(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return client;
}

export const http = createClient();

// --- Helpers tipados ---------------------------------------------------------

/** GET que desembrulha `{ data }`. */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const { data } = await http.get<Envelope<T>>(url, { params });
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET de listagem que devolve itens e metadados de paginação juntos. */
export async function getPage<T>(url: string, params?: Record<string, unknown>): Promise<Page<T>> {
  try {
    const { data } = await http.get<Envelope<T[]>>(url, { params });
    return {
      items: data.data ?? [],
      meta: data.meta ?? {
        page: 1,
        limit: data.data?.length ?? 0,
        total: data.data?.length ?? 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    throw toApiError(error);
  }
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  try {
    const { data } = await http.post<Envelope<T>>(url, body);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  try {
    const { data } = await http.put<Envelope<T>>(url, body);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  try {
    const { data } = await http.patch<Envelope<T>>(url, body);
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** Para endpoints 204, que não devolvem corpo. */
export async function del(url: string): Promise<void> {
  try {
    await http.delete(url);
  } catch (error) {
    throw toApiError(error);
  }
}

/** Escrita em endpoints que respondem 204, sem corpo para desembrulhar. */
export async function send(
  method: 'post' | 'put' | 'patch',
  url: string,
  body?: unknown,
): Promise<void> {
  try {
    await http[method](url, body);
  } catch (error) {
    throw toApiError(error);
  }
}
