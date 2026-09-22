/**
 * Ponto único de leitura das variáveis de ambiente do frontend.
 *
 * Apenas variáveis prefixadas com NEXT_PUBLIC_ chegam ao browser; qualquer
 * segredo deve ficar exclusivamente no backend Go.
 */

const DEFAULT_API_URL = 'http://localhost:8080/api/v1';

function readApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXT_PUBLIC_API_URL não está definida. Configure-a antes do build de produção.',
      );
    }
    return DEFAULT_API_URL;
  }

  // Normaliza removendo a barra final para evitar "//" ao concatenar rotas.
  return raw.replace(/\/+$/, '');
}

export const env = {
  apiUrl: readApiUrl(),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

/** Nome do cookie que guarda a sessão do usuário. */
export const AUTH_COOKIE = '@educagil.token';
