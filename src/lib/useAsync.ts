'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList, Dispatch, SetStateAction } from 'react';
import { toApiError } from './http';
import type { ApiError } from './http';

export interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  /** Refaz a requisição mantendo os dados atuais visíveis até a resposta. */
  reload: () => void;
  /** Atualização otimista local, sem nova requisição. */
  setData: Dispatch<SetStateAction<T | null>>;
}

/**
 * Carrega dados assíncronos com os três estados que toda tela precisa
 * (carregando, erro, pronto).
 *
 * Respostas que chegam depois de o componente desmontar, ou depois de uma
 * requisição mais nova, são descartadas — sem isso, trocar rápido de filtro
 * pode exibir o resultado da busca anterior.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
  options: { enabled?: boolean } = {},
): AsyncState<T> {
  const { enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [version, setVersion] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(toApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências são as do chamador
  }, [...deps, enabled, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { data, error, loading, reload, setData };
}
