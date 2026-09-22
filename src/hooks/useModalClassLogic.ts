import { useEffect, useState } from "react";
import { setupAPIClient } from "@/services/api/apiClient";
import { videoService } from "@/services/videos/videoService";
import { lessonsService } from "@/services/lessons/lessonService";

interface UseModalClassLogicProps {
  videoId?: number | null;
  lessonDescription?: string;
}

export function useModalClassLogic({
  videoId,
  lessonDescription,
}: UseModalClassLogicProps) {
  const [lessonId, setLessonId] = useState<number | "">("");
  const [desc, setDesc] = useState(lessonDescription ?? "");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [videoFileUrl, setVideoFileUrl] = useState<string>("");

  const maxTags = 8;
  const acceptedFormats = ["mp4", "mov", "avi"];
  const hasVideo = !!selectedFile || !!videoFileUrl;
  const hasYoutubeUrl = !!youtubeUrl.trim();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < maxTags) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

 useEffect(() => {
  async function fetchVideoAndLesson() {
    if (!videoId) return;
    setIsLoading(true);

    try {
      const apiClient = setupAPIClient();
      const videoResponse = await apiClient.get(`/videos/${videoId}/`);
      const videoData = videoResponse.data;

      // Se não tiver lesson, só seta o vídeo e volta
      if (!videoData.lesson) {
        setTitle(videoData.title);
        setYoutubeUrl(videoData.youtube_url || "");
        setThumbnail(videoData.thumbnail || "");
        setVideoFileUrl(videoData.video_file || "");
        setLessonId("");
        setDesc("");
        return;
      }

      // Busca vídeo e lesson em paralelo
      const [lessonResponse] = await Promise.all([
        apiClient.get(`/lessons/${videoData.lesson}/`),
      ]);

      const lessonData = lessonResponse.data;

      setTitle(videoData.title);
      setYoutubeUrl(videoData.youtube_url || "");
      setThumbnail(videoData.thumbnail || "");
      setVideoFileUrl(videoData.video_file || "");
      setLessonId(videoData.lesson);
      setDesc(lessonData.description || "");
    } catch (error) {
      console.error(error);
      setError("Erro ao carregar dados do vídeo e aula.");
    } finally {
      setIsLoading(false);
    }
  }

  fetchVideoAndLesson();
}, [videoId]);

  function getFileNameFromUrl(url: string): string {
    return decodeURIComponent(url.split("/").pop() ?? "");
  }

  function isAcceptedFormat(fileName: string): boolean {
    const acceptedFormats = ["mp4", "mov", "avi"];
    const ext = fileName.split(".").pop()?.toLowerCase();
    return acceptedFormats.includes(ext ?? "");
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file && isAcceptedFormat(file.name)) {
      setSelectedFile(file);
      setYoutubeUrl("");
      setError(null);
    } else {
      setError(
        "Formato inválido. Apenas arquivos .mp4, .mov e .avi são permitidos."
      );
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && isAcceptedFormat(file.name)) {
      setSelectedFile(file);
      setYoutubeUrl("");
      setError(null);
    } else {
      setError(
        "Formato inválido. Apenas arquivos .mp4, .mov e .avi são permitidos."
      );
    }
  }

  async function handleSubmit(onClose: () => void, videoId?: number | null) {
    if (!title) {
      setError("O título da aula é obrigatório.");
      return;
    }

    if (!selectedFile && !youtubeUrl && !videoFileUrl) {
      setError(
        "Você precisa selecionar um arquivo ou fornecer uma URL do YouTube."
      );
      return;
    }

    try {
      setIsLoading(true);
      let videoResponse;

      if (videoId) {
        const formData = new FormData();
        formData.append("id", String(videoId));
        formData.append("title", title);
        formData.append("lesson", String(lessonId));
        formData.append("description", desc);
        if (youtubeUrl) formData.append("youtube_url", youtubeUrl);
        if (thumbnail) formData.append("thumbnail", thumbnail);
        if (selectedFile) formData.append("video_file", selectedFile);

        videoResponse = await videoService.updateVideo(
          videoId,
          formData
        );

        const lessonUpdateResponse = await lessonsService.updateLesson(
          Number(lessonId),
          {
            title,
            description: desc,
          }
        );

        if (!lessonUpdateResponse.success) throw lessonUpdateResponse.rawError;
      } else {
        const lessonResponse = await lessonsService.createLessons({
          title,
          description: desc,
        });

        if (!lessonResponse.success) {
          throw lessonResponse.rawError;
        }
        const createdLessonId = lessonResponse.data.id;
        console.log("📘 ID da aula criada:", createdLessonId);
        setLessonId(createdLessonId);
        const videoResponse = await videoService.uploadVideo({
          title,
          lesson: createdLessonId,
          youtube_url: youtubeUrl || undefined,
          video_file: selectedFile ?? undefined,
          thumbnail: thumbnail || undefined,
        });

        if (!videoResponse.success) {
          console.error(
            "❌ Erro ao criar vídeo:",
            videoResponse.rawError?.response?.data
          );
          throw videoResponse.rawError;
        }
      }

      alert(`Aula ${videoId ? "editada" : "criada"} com sucesso!`);
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data;
      if (detail?.title?.[0]?.includes("já existe")) {
        setError("Já existe uma aula com este título. Escolha outro.");
      } else {
        setError(`Erro ao ${videoId ? "editar" : "criar"} vídeo e aula.`);
      }
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    lessonId,
    setLessonId,
    desc,
    setDesc,
    title,
    setTitle,
    acceptedFormats,
    selectedFile,
    setSelectedFile,
    youtubeUrl,
    setYoutubeUrl,
    thumbnail,
    setThumbnail,
    isDragOver,
    setIsDragOver,
    isLoading,
    setIsLoading,
    error,
    setError,
    selectedTags,
    setSelectedTags,
    videoFileUrl,
    setVideoFileUrl,
    maxTags,
    hasVideo,
    hasYoutubeUrl,
    toggleTag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleSubmit,
    isAcceptedFormat,
    getFileNameFromUrl,
  };
}
