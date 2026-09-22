import { videoDelete } from "./deleteVideo";
import { getAllVideos } from "./getVideos";
import { handleApiError, setupAPIClient } from "@/services/api/api";
import { ApiResponse } from "../types";
import { Video, CreateVideoPayload, UpdateVideoPayload } from "./types";
import { uploadVideo } from "./uploadVideo";
import { /* The `videoUpdate` function is not defined in the provided TypeScript
code snippet. Instead, there are functions named `updateVideo` and
`updateVideoWithFormData` that handle updating video data. */
videoUpdate } from "./updateVideo";

const getVideos = async (): Promise<ApiResponse<Video[]>> => {
  try {
    const response = await getAllVideos();
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    return {
      success: false,
      error: errorMessage,
      status: (error as any)?.response?.status,
      rawError: error,
    };
  }
};

const createVideo = async (formData: FormData) => {
  const api = setupAPIClient();

  try {
    const response = await api.post("/videos/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Erro ao enviar vídeo:", error);
    return { success: false, rawError: error };
  }
};

const  updateVideo = async (id: number, data: FormData) => {
  const api = setupAPIClient();
  const response = await api.put(`/videos/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return { success: true, data: response.data };
};




const deleteVideo = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await videoDelete(id);
    return {
      success: true,
      status: response.status,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleApiError(error),
      status: (error as any)?.response?.status,
      rawError: error,
    };
  }
};

export const videoService = {
  uploadVideo,
  updateVideo,
  createVideo,
  getVideos,
  deleteVideo,
};
