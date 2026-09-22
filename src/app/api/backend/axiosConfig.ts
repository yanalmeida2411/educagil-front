import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { AuthTokenError } from "@/services/errors/AuthTokenError"; 

// Interface extendida para o config do Axios, adicionando _retry
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export function setupAPIClient(ctx = undefined) {
  const BASE_URL = "https://back-educagil.onrender.com";

  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: (() => {
        try {
          const tokenData = JSON.parse(cookies["@educagil.token"] || "{}");
          return `Bearer ${tokenData.access}`;
        } catch {
          return "";
        }
      })(),
    },
    withCredentials: true,
  });

  // Interceptor para adicionar Authorization e X-CSRFTOKEN em cada requisição
  api.interceptors.request.use((config) => {
    cookies = parseCookies(ctx); // atualiza cookies

    try {
      const tokenData = JSON.parse(cookies["@educagil.token"] || "{}");
      const accessToken = tokenData.access;
      if (accessToken && config.headers) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    } catch {}

    const csrfToken = cookies["csrftoken"];
    if (csrfToken && config.headers) {
      config.headers["X-CSRFTOKEN"] = csrfToken;
    }

    return config;
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
              if (!originalRequest.headers) originalRequest.headers = {};
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
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: "/",
          });

          api.defaults.headers.common["Authorization"] = "Bearer " + access;
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = "Bearer " + access;
          }

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
