import { useState, useEffect } from "react";
import { videoService } from "@/app/api/backend/services/videoService";

import type { CreateVideoPayload } from "@/app/api/types/types";
interface MyModalProps {
  onClose: () => void;

}

interface UseVideosProps {
  onClose: () => void;
}


export const useVideos = ({ onClose }: MyModalProps) => {
  const [lessonId, setLessonId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedFormats = ["mp4", "avi", "mkv"];
  const displayAcceptedFormats = acceptedFormats
    .map((format) => `.${format}`)
    .join(", ");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension && acceptedFormats.includes(fileExtension)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setSelectedFile(null);
        setError(
          `Formato de arquivo não aceito. Por favor, selecione um dos seguintes: ${displayAcceptedFormats}`
        );
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension && acceptedFormats.includes(fileExtension)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setSelectedFile(null);
        setError(
          `Formato de arquivo não aceito. Por favor, selecione um dos seguintes: ${displayAcceptedFormats}`
        );
      }
    }
  };

 async function handleSubmit() {
    setError(null);

    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    if (!lessonId || Number(lessonId) <= 0) {
      setError("O ID da aula deve ser um número válido.");
      return;
    }

    if (!selectedFile && !youtubeUrl.trim()) {
      setError("Você deve enviar um arquivo de vídeo ou um link do YouTube.");
      return;
    }

    const payload: CreateVideoPayload = {
      title: title.trim(),
      lesson: Number(lessonId),
      video_file: selectedFile as File, 
      youtube_url: youtubeUrl.trim() || undefined,
      video_id: videoId.trim() || "",
      thumbnail: thumbnail.trim() || "",
    };

    setIsLoading(true);

   const response = await videoService.createVideo(payload);

    setIsLoading(false);

    if (response.success) {
      onClose();
    } else {
      setError(response.error || "Erro ao criar aula.");
    }
  }



  return {
     lessonId,
    setLessonId,
    title,
    setTitle,
    selectedFile,
    setSelectedFile,
    isDragOver,
    setIsDragOver,
    isLoading,
    setIsLoading,
    error,
    setError,
    acceptedFormats,
    displayAcceptedFormats,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    youtubeUrl,
    setYoutubeUrl,
    videoId,
    setVideoId,
    thumbnail,
    setThumbnail,
  };
};
