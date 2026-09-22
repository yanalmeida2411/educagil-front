import { setupAPIClient } from "@/services/api/apiClient";
import { UpdateVideoPayload, Video } from "./types";

export const videoUpdate = async (
  id: number,
  videoData: UpdateVideoPayload
) => {
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

  if (videoData.video_id?.trim()) {
    formData.append("video_id", videoData.video_id);
  }

  if (videoData.thumbnail?.trim()) {
    formData.append("thumbnail", videoData.thumbnail);
  }

 try {
    return await api.put<Video>(
      `/videos/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error: any) {
  if (error.response) {
    console.error("Erro detalhado:", error.response.data); 
    console.error("Status:", error.response.status);
    console.error("Headers:", error.response.headers);
  } else {
    console.error("Erro inesperado:", error.message);
  }
  throw error;
}
};