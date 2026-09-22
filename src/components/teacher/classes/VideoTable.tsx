'use client';

import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEdit } from "react-icons/md";

import React, { useEffect, useState } from 'react';
import { videoService } from '../../../services/videos/videoService';
import Pagination from "../../../components/ui/Pagination";
//import ModalClass from "../../ui/Teacher/ModalClass";
import ModalClass from '../../teacher/modal/ModalClass';
import ConfirmDeleteModal from "@/components/actions/ConfirmDeleteModal";
import { Lessons } from "@/services/lessons/types";
import { lessonsService } from "@/services/lessons/lessonService";
import EmptyClassroom from "@/components/ui/Teacher/EmptyClassroom";
export interface Video {
    id: number;
    title: string;
    youtube_url: string | undefined;
    uploaded_at: string;
    video_id: string;
    thumbnail: string;
    video_file: string;
    video_type: string;
    video_url: string | undefined;
    lesson: number;
}

const ITEMS_PER_PAGE = 5;

const VideoTable = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videoId, setVideoId] = useState<number | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [lessons, setLessons] = useState<Lessons[]>([]);
    const [lessonsToDelete, setLessonsToDelete] = useState<number | null>(null);

    const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
    const [currentLessonDescription, setCurrentLessonDescription] = useState<string>("");

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        fetchVideos();
        setVideoId(null);
    };

    const handleEditVideo = (videoId: number, lessonDescription: string) => {
        setVideoId(videoId);
        setCurrentLessonDescription(lessonDescription || "");
        setIsModalOpen(true);
    };


    const handleDeleteVideo = (id: number) => {
  const video = videos.find((v) => v.id === id);

  if (!video) {
    alert("Vídeo não encontrado.");
    return;
  }

  setVideoToDelete(id);
  setLessonsToDelete(video.lesson); // ← ESSE é o ID real da lesson
  setIsConfirmModalOpen(true);
};


const confirmDelete = async () => {
  if (lessonsToDelete === null) return;

  try {
    const lesson = await lessonsService.deleteLesson(lessonsToDelete);

    if (lesson.success) {
      alert("Aula e vídeo deletados com sucesso!");
      setVideos((prev) => prev.filter((v) => v.lesson !== lessonsToDelete));
      setLessons((prev) => prev.filter((l) => l.id !== lessonsToDelete));
    } else {
      alert(`Erro ao deletar aula: ${lesson.error}`);
      setError(lesson.error);
    }
  } catch (err: any) {
    console.error("Erro inesperado ao deletar:", err);
    alert("Erro inesperado ao deletar aula.");
    setError("Erro inesperado ao deletar.");
  } finally {
    setIsConfirmModalOpen(false);
    setVideoToDelete(null);
    setLessonsToDelete(null);
  }
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

    useEffect(() => {
        fetchLessons();
    }, []);




    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
    const paginatedVideos = videos.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };



    if (loading) return <p className="p-4">Carregando vídeos...</p>;
    // if (videos.length === 0) return <EmptyClassroom />;


    const openEditModal = (id: number) => {
        setEditingVideoId(id);
        setIsModalOpen(true);
    };


    return (
        <div className="overflow-x-auto">


            <div className="flex justify-between mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-[40px] font-semibold">Minhas aulas</h1>
                <button
                    type="button"
                    onClick={openModal}
                    className="bg-[#0092BA] flex justify-center text-white text-base sm:text-lg font-semibold leading-6 px-6 py-3 rounded-lg hover:bg-[#007B9E] transition-colors cursor-pointer"
                >
                    Criar aula
                </button>
                {isModalOpen && <ModalClass onClose={closeModal} videoId={videoId} />}

            </div>


            <table className=" divide-y divide-[#B0B0B0]">

                <thead className="block md:hidden px-4 py-2 font-semibold text-[16px] text-[#6D6D6D] text-start">
                    <tr>
                        <th>Vídeo</th>
                    </tr>
                </thead>


                <thead className="hidden md:table-header-group">
                    <tr className="text-left text-[18px] font-semibold text-[#6D6D6D]">
                        <th className="p-4">Vídeo</th>
                        <th className="py-4">Data Publicação</th>
                        <th className="p-4 text-center">Visualizações</th>
                        <th className="p-4 text-center">Comentários</th>
                        <th className="p-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[16px]">
                    {paginatedVideos.map((video) => {
                       const lesson = lessons.find(l => l.id === video.lesson);


                        return (
                            <tr key={video.id} className="hover:bg-gray-50 transition w-full">
                                <td className="py-4 flex flex-col items-center gap-4 md:flex-row">
                                    <img
                                        src={video.thumbnail || '/assets/svg/educAgilPadrao.svg'}
                                        alt={video.title ? `Miniatura do vídeo: ${video.title}` : 'Miniatura do vídeo'}
                                        className="w-[280px] md:w-44 md:h-22 object-cover rounded-xl shadow-sm"
                                    />
                                    <div className="w-full md:w-[350px] min-w-0">
                                        <div className="flex items-center gap-4 justify-between">
                                            <h3 className="font-semibold text-[12px] md:text-[16px]">{video.title}</h3>
                                            <div className="table-cell md:hidden text-[#6D6D6D]">
                                               <button className="text-[#026B88] px-2 cursor-pointer">
                                                    <MdOutlineEdit size={20} onClick={() => openEditModal(video.id && lesson.id)} />
                                                </button>
                                                <button className="hover:text-red-600 px-2 cursor-pointer">
                                                    <RiDeleteBin6Line size={20} />
                                                </button>
                                            </div>
                                        </div>


                                        <p className="text-[#6D6D6D] font-normal line-clamp-2 text-[12px] md:text-[16px]">
                                            {lesson?.description ?? 'Sem descrição da lição'}
                                        </p>

                                        <p className="table-cell font-normal text-[12px] py-2 md:hidden text-[#6D6D6D]">
                                            {formatDate(video.uploaded_at)}
                                        </p>
                                    </div>
                                </td>

                                <td className="hidden md:table-cell py-4 px-2 font-normal text-[#6D6D6D]">
                                    {formatDate(video.uploaded_at)}
                                </td>
                                <td className="hidden md:table-cell py-4 font-normal text-[#6D6D6D] text-center">0</td>
                                <td className="hidden md:table-cell py-4 font-normal text-[#6D6D6D] text-center">0</td>
                                <td className="hidden md:table-cell py-4 font-normal text-[#6D6D6D] text-center">
                                    <div className="flex gap-2 justify-center">
                                          <button className="hover:text-[#026B88] px-2 cursor-pointer">
                                            <MdOutlineEdit size={24} onClick={() => handleEditVideo(video.id, lesson.description)} />
                                        </button>
                                        <button className="text-red-600 px-2 cursor-pointer">
                                            <RiDeleteBin6Line size={24} onClick={() => handleDeleteVideo(video.id)} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

            <div className=" bottom-30 right-10  bg-white border-t border-gray-200">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevious={goToPreviousPage}
                    onNext={goToNextPage}
                />
            </div>
            {isModalOpen && <ModalClass onClose={closeModal} videoId={videoId} />}
            {isConfirmModalOpen && (
                <ConfirmDeleteModal
                    onClose={() => {
                        setIsConfirmModalOpen(false);
                        setVideoToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                />
            )}



        </div>
    );
};

export default VideoTable;
