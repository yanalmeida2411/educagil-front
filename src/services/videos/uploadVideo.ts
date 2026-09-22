import { setupAPIClient } from "@/services/api/apiClient";
import { CreateVideoPayload, Video } from "./types";


export const uploadVideo = async (videoData: CreateVideoPayload) => {
  const api = setupAPIClient();
  const formData = new FormData();

  formData.append("title", videoData.title);
  formData.append("lesson", String(videoData.lesson));

  if (videoData.video_file) {
    formData.append("video_file", videoData.video_file);
  }

  if (videoData.youtube_url?.trim()) {
    formData.append("youtube_url", videoData.youtube_url);
  }

  if (videoData.thumbnail?.trim()) {
    formData.append("thumbnail", videoData.thumbnail);
  }

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
