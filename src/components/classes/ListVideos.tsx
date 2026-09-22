'use client';

import React, { useEffect, useState } from 'react';
import { Video } from '../../app/api/types/types';
import EmptyClassroom from '../ui/Teacher/EmptyClassroom';
import ModalClass from '../ui/Teacher/ModalClass';
import { setupAPIClient } from '../../services/api/apiClient';
import ConfirmDeleteModal from '../actions/ConfirmDeleteModal';

import { videoService } from "@/services/videos/videoService";
import { lessonsService } from '@/services/lessons/lessonService';
import { Lessons } from '@/services/lessons/types';
const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [lessons, setLessons] = useState<Lessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [videoId, setVideoId] = useState<number | null>(null);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchVideos();
    setVideoId(null);
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await videoService.getVideos();
      if (response.success && response.data) {
        setVideos(response.data);
      } else {
        setError(response.error || 'Falha ao carregar vídeos.');
        console.error('Erro na resposta da API ao buscar vídeos:', response.rawError);
      }
    } catch (err: unknown) {
      setError('Ocorreu um erro inesperado ao carregar vídeos.');
      console.error('Erro inesperado ao buscar vídeos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);


const fetchLessons = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await lessonsService.getLessons();

    if (response.success && response.data) {
      setLessons(response.data);
    } else {
      const errorMessage = response.error || 'Falha ao carregar vídeos.';
      setError(errorMessage);
      console.error('Erro na resposta da API ao buscar vídeos:', response.rawError || response);
    }
  } catch (err) {
    setError('Ocorreu um erro inesperado ao carregar vídeos.');
    console.error('Erro inesperado ao buscar vídeos:', err);
  } finally {
    setLoading(false);
  }
};




  const confirmDelete = async () => {
    if (videoToDelete === null) return;
    const apiClient = setupAPIClient();
    try {
      await apiClient.delete(`/video/${videoToDelete}/`);
      alert("Vídeo deletado com sucesso!");
      setVideos((prev) => prev.filter((video) => video.id !== videoToDelete));
    } catch (err: any) {
      setError("Erro ao deletar vídeo");
      if (err.response) {
        alert(`Erro ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      }
    } finally {
      setIsConfirmModalOpen(false);
      setVideoToDelete(null);
    }
  };

  if (loading)
  return (
    <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-600">
      <svg className="w-5 h-5 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Carregando vídeos...
    </div>
  );
  if (error) return <p className="text-center p-4 text-red-500">{error}</p>;
  if (videos.length === 0) return <EmptyClassroom />;


  return (
    <div className="gap-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-[40px]">Minhas aulas</h1>
        <button
          type="button"
          onClick={openModal}
          className="bg-[#0092BA] flex justify-center text-white text-base sm:text-lg font-semibold leading-6 px-6 py-3 rounded-lg hover:bg-[#007B9E] transition-colors cursor-pointer"
        >
          Criar aula
        </button>
        {isModalOpen && <ModalClass onClose={closeModal} videoId={videoId} />}

      </div>

      <section className={`container flex-column`}>

        {isConfirmModalOpen && (
          <ConfirmDeleteModal
            onClose={() => {
              setIsConfirmModalOpen(false);
              setVideoToDelete(null);
            }}
            onConfirm={confirmDelete}
          />
        )}

      </section>
    </div>
  );
};

export default VideoList;