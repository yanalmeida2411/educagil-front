import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";
import { ApiErrorResponse } from "@/app/api/types/types";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}


export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response) {
      const { data, status } = axiosError.response;
      const message =
        data?.message || data?.error || data?.detail ||
        (status >= 400 && status < 500
          ? "Requisição inválida."
          : "Erro no servidor.");
      return `Erro: ${message} (Status: ${status})`;
    } else if (axiosError.request) {
      return "Erro de rede: O servidor não respondeu.";
    } else {
      return `Erro inesperado: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    return `Erro inesperado: ${error.message}`;
  } else {
    return "Erro desconhecido.";
  }
};

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const BASE_URL = "https://back-educagil.onrender.com/";

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: (() => {
        try {
          const tokenData = JSON.parse(cookies["@educagil.token"] || "{}");
          return `Bearer ${tokenData.access}`;
        } catch {
          return "";
        }
      })(),
    },
  });

  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
   
      const originalRequest = error.config as CustomAxiosRequestConfig;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        cookies = parseCookies(ctx);
        const tokenData = JSON.parse(cookies["@educagil.token"] || "{}");
        const refreshToken = tokenData.refresh;

        try {
          const response = await api.post("/token/refresh/", { refresh: refreshToken });

          const { access, refresh: newRefresh } = response.data;

          const newTokenData = {
            ...tokenData,
            access,
            refresh: newRefresh || refreshToken,
          };

          setCookie(ctx, "@educagil.token", JSON.stringify(newTokenData), {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          api.defaults.headers.common["Authorization"] = "Bearer " + access;
          originalRequest.headers["Authorization"] = "Bearer " + access;

          processQueue(null, access);
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          destroyCookie(ctx, "@educagil.token");
          return Promise.reject(new AuthTokenError());
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
