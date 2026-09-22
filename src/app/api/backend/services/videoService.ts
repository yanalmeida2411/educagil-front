import { setupAPIClient } from "../axiosConfig";
import axios, { AxiosError } from "axios";
import {
  Video,
  CreateVideoPayload,
  UpdateVideoPayload,
  ApiResponse,
  ApiErrorResponse,
} from "../../types/types";

const getCsrfTokenFromCookie = (): string | null => {
  const name = "csrftoken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response) {
      const { data, status } = axiosError.response;
      const serverErrorMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        (status >= 400 && status < 500
          ? "Requisição inválida."
          : "Erro no servidor.");
      return `Erro: ${serverErrorMessage} (Status: ${status})`;
    } else if (axiosError.request) {
      return "Erro de rede: O servidor não respondeu. Verifique sua conexão ou tente novamente mais tarde.";
    } else {
      return `Erro inesperado na requisição: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    return `Ocorreu um erro inesperado: ${error.message}`;
  } else {
    return "Um erro inesperado ocorreu. Por favor, tente novamente.";
  }
};

export const videoService = {
 
  async getAllVideos(): Promise<ApiResponse<Video[]>> {
    try {
     
      const api = setupAPIClient();
      const response = await api.get<Video[]>("/video/", {
        headers: {
       
          Accept: "application/json",
        },
      });

      return { success: true, data: response.data, status: response.status };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao buscar todos os vídeos:", error);
      return {
        success: false,
        error: errorMessage,
        status: (error as AxiosError).response?.status,
        rawError: error,
      };
    }
  },

  /*async getVideoById(id: number): Promise<ApiResponse<Video>> {
    try {
      const api = setupAPIClient();
      const response = await api.get<Video>(`/videos/video/${id}`);
      return { success: true, data: response.data, status: response.status };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao buscar vídeo com ID ${id}:`, error);
      return {
        success: false,
        error: errorMessage,
        status: (error as AxiosError).response?.status,
        rawError: error,
      };
    }
  },*/

async createVideo(videoData: CreateVideoPayload): Promise<ApiResponse<Video>> {
  const csrfToken = getCsrfTokenFromCookie();

  const formData = new FormData();
  formData.append("title", videoData.title);
  formData.append("lesson", String(videoData.lesson));

  if (videoData.video_file) {
    formData.append("video_file", videoData.video_file);
  }

  if (videoData.youtube_url && videoData.youtube_url.trim() !== "") {
    formData.append("youtube_url", videoData.youtube_url);
  }

  if (videoData.video_id && videoData.video_id.trim() !== "") {
    formData.append("video_id", videoData.video_id);
  }

  if (videoData.thumbnail && videoData.thumbnail.trim() !== "") {
    formData.append("thumbnail", videoData.thumbnail);
  }

  try {
    const api = setupAPIClient(); 

    const response = await api.post<Video>("/video/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data, status: response.status };
    } else {
      return {
        success: false,
        error: `Resposta inesperada do servidor (Status: ${response.status})`,
        status: response.status,
        rawError: response.data,
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
      status: (error as AxiosError).response?.status,
      rawError: error,
    };
  }
},


  async updateVideo(
    id: number,
    videoData: UpdateVideoPayload
  ): Promise<ApiResponse<Video>> {
    try {
      const api = setupAPIClient();
      const response = await api.put<Video>(`/videos/video/${id}`, videoData);
      return { success: true, data: response.data, status: response.status };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao atualizar vídeo com ID ${id}:`, error);
      return {
        success: false,
        error: errorMessage,
        status: (error as AxiosError).response?.status,
        rawError: error,
      };
    }
  },

  async partialUpdateVideo(
    id: number,
    videoData: UpdateVideoPayload
  ): Promise<ApiResponse<Video>> {
    try {
      const api = setupAPIClient();
      const response = await api.patch<Video>(`/videos/video/${id}`, videoData);
      return { success: true, data: response.data, status: response.status };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error(
        `Erro ao atualizar parcialmente vídeo com ID ${id}:`,
        error
      );
      return {
        success: false,
        error: errorMessage,
        status: (error as AxiosError).response?.status,
        rawError: error,
      };
    }
  },

  async deleteVideo(id: number): Promise<ApiResponse<void>> {
    try {
      const api = setupAPIClient();
      const response = await api.delete(`/videos/video/${id}`);
      return { success: true, status: response.status };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error(`Erro ao deletar vídeo com ID ${id}:`, error);
      return {
        success: false,
        error: errorMessage,
        status: (error as AxiosError).response?.status,
        rawError: error,
      };
    }
  },
};
