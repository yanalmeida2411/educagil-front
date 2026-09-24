
import { setupAPIClient } from '@/services/api/apiClient';
import React, { useEffect, useState } from 'react';
import { MdInsertLink } from "react-icons/md";
import { videoService } from "@/services/videos/videoService";
import { UpdateVideoPayload } from '@/services/videos/types';
import { lessonsService } from "@/services/lessons/lessonService";
interface MyModalProps {
  onClose: () => void;
  videoId?: number | null;
  lessonId?: number | null;
  lessonDescription?: string;
}

type TagCategory = {
  title: string;
  tags: string[];
};

const tagCategories: TagCategory[] = [
  {
    title: 'Tecnologia / Desenvolvimento',
    tags: ['#FrontEnd', '#BackEnd', '#TypeScript', '#Git', '#Arquitetura', '#Testes', '#Next.js'],
  },
  {
    title: 'Agilidade',
    tags: ['#Scrum', '#Kanban', '#Lean', '#CerimôniasÁgeis'],
  },
  {
    title: 'Produto / Negócio',
    tags: ['#ProductManagement', '#Discovery', '#Métricas', '#Roadmap', '#GoToMarket'],
  },
  {
    title: 'UX / UI',
    tags: ['#UX', '#UI', '#Figma', '#PesquisaDeUsuário', '#Acessibilidade'],
  },
  {
    title: 'Nível',
    tags: ['#Iniciante', '#Intermediário', '#Avançado'],
  },
];

function getFileNameFromUrl(url: string): string {
  return decodeURIComponent(url.split('/').pop() ?? '');
}


export default function ModalClass({ onClose, videoId, lessonDescription }: MyModalProps) {
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
  const hasVideo = !!selectedFile || !!videoFileUrl;
  const hasYoutubeUrl = !!youtubeUrl.trim();
  const [localLessonDescription, setLocalLessonDescription] = useState("");

  const maxTags = 8;
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  async function handleSubmit(e?: React.FormEvent) {
  e?.preventDefault();

  const isEditing = !!videoId;

  if (!title || !lessonId) {
    setError("Título e ID da aula são obrigatórios.");
    return;
  }

  if (!selectedFile && !youtubeUrl && !videoFileUrl) {
    setError("Você precisa selecionar um arquivo ou fornecer uma URL do YouTube.");
    return;
  }

  try {
    setIsLoading(true);
    let videoResponse;

    if (isEditing) {
      // Usar FormData se tiver arquivo
      const formData = new FormData();
      formData.append("id", String(videoId));
      formData.append("title", title);
      formData.append("lesson", String(lessonId));
      formData.append("description", desc);
      if (youtubeUrl) formData.append("youtube_url", youtubeUrl);
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (selectedFile) formData.append("video_file", selectedFile);

      // Atualiza o vídeo
     videoResponse = await videoService.updateVideo(videoId, formData);

      // Atualiza a aula com o mesmo título e descrição
      const lessonUpdateResponse = await lessonsService.updateLesson(Number(lessonId), {
        title,
        description: desc,
      });

      if (!lessonUpdateResponse.success) throw lessonUpdateResponse.rawError;

    } else {
      // Criação do vídeo
      const formData = new FormData();
      formData.append("title", title);
      formData.append("lesson", String(lessonId));
      formData.append("video_id", "");
      if (youtubeUrl) formData.append("youtube_url", youtubeUrl);
      if (selectedFile) formData.append("video_file", selectedFile);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      videoResponse = await videoService.createVideo(formData);

      // Criação da aula com o mesmo título e descrição
      const lessonResponse = await lessonsService.createLessons({
        id: Number(lessonId),
        title,
        description: desc,
      });

      if (!lessonResponse.success) throw lessonResponse.rawError;
    }

    if (!videoResponse.success) throw videoResponse.rawError;

    alert(`Aula ${isEditing ? "editada" : "criada"} com sucesso!`);
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





  useEffect(() => {
    async function fetchVideoData() {
      if (!videoId) {
        setTitle("");
        setDesc(lessonDescription ?? "");
        setLessonId("");
        setYoutubeUrl("");
        setThumbnail("");
        setSelectedFile(null);
        setLocalLessonDescription("");
        return;
      }

      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get(`/video/${videoId}/`);
        const data = response.data;

        setTitle(data.title);
        setDesc(data.description);
        setLessonId(data.lesson);
        setYoutubeUrl(data.youtube_url || "");
        setThumbnail(data.thumbnail || "");
        setVideoFileUrl(data.video_file || "");

       
        if (data.title) {
          const allLessonsResponse = await lessonsService.getLessons(); 
          if (allLessonsResponse.success && Array.isArray(allLessonsResponse.data)) {
            const matchedLesson = allLessonsResponse.data.find((lesson: any) =>
              data.title.includes(lesson.title)
            );

            if (matchedLesson) {
              setLocalLessonDescription(matchedLesson.description || "");
              console.log("Lesson encontrada por título:", matchedLesson);
            } else {
              console.warn("Nenhuma lesson encontrada com esse título.");
            }
          }
        }
      } catch (err) {
        setError("Erro ao carregar dados do vídeo ou da aula.");
        console.error(err);
      }
    }

    fetchVideoData();
  }, [videoId]);


  const acceptedFormats = ["mp4", "mov", "avi"];

  function isAcceptedFormat(fileName: string): boolean {
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
      setError("Formato inválido. Apenas arquivos .mp4, .mov e .avi são permitidos.");
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && isAcceptedFormat(file.name)) {
      setSelectedFile(file);
      setYoutubeUrl("");
      setError(null);
    } else {
      setError("Formato inválido. Apenas arquivos .mp4, .mov e .avi são permitidos.");
    }
  }


  return (

    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center flex-col mt-32">
      <div className="bg-white rounded-lg relative max-w-4xl w-full transform transition-all duration-300 scale-100 opacity-100">
        <div className="pb-4 border-b border-[#E6E6E6] flex justify-between items-center">
          <button
            onClick={onClose}
            className="absolute cursor-pointer right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            aria-label="Fechar modal"
          >
            x
          </button>
          <div>
            <h2 className="text-[40px] font-bold text-[#161616]">{videoId ? 'Editar aula' : 'Criar aula'}</h2>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl w-full">

        <div className="bg-white border-2 border-[#E6E6E6] rounded-lg shadow-xl p-6 relative gap-8">
          <h2 className="text-[28px] font-bold mb-4 text-[#515153]">Arquivo</h2>
          <p className="text-[18px] font-light mb-4 text-[#6D6D6D]">Selecione um arquivo ou insira o URL do Youtube para carregar sua aula.</p>


          <div
            onDragOver={youtubeUrl ? undefined : handleDragOver}
            onDragLeave={youtubeUrl ? undefined : handleDragLeave}
            onDrop={youtubeUrl ? undefined : handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center flex flex-col items-center justify-center h-[400px] transition-colors duration-200
                        ${isDragOver && !youtubeUrl ? 'border-[#0092BA] bg-[#E0F7FA]' : 'border-gray-300 bg-gray-50'}
                        ${youtubeUrl ? 'opacity-50 cursor-not-allowed' : ''}`} >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#0092BA] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {selectedFile ? (
              <p className="text-[18px] text-gray-700 mb-1">
                Arquivo selecionado: <span className="font-semibold">{selectedFile.name}</span>
              </p>
            ) : videoFileUrl ? (
              <div className="text-[16px] text-gray-700 mb-1">
                Arquivo atual:{" "}
                <span className="font-semibold text-[#0092BA]">{getFileNameFromUrl(videoFileUrl)}</span>
                <button
                  onClick={() => {
                    setVideoFileUrl("");
                    setSelectedFile(null);
                  }}
                  className="ml-2 text-sm text-red-600 hover:underline"
                >
                  Substituir arquivo
                </button>
              </div>
            ) : (
              <p className="text-[18px] text-gray-700 mb-1">Arraste o arquivo aqui</p>
            )}

            <p className="text-[16px] font-normal text-gray-500 mb-4"> Formatos aceitos: {acceptedFormats.join(", ")}</p>
            <input
              type="file"
              id="video-upload-input"
              accept={acceptedFormats.map(format => `.${format}`).join(',')}
              onChange={handleFileChange}
              className="hidden"
              disabled={!!youtubeUrl}
            />
            <button
              type="button"
              disabled={hasYoutubeUrl}
              onClick={() => {
                if (!hasYoutubeUrl) {
                  document.getElementById('video-upload-input')?.click();
                }
              }}
              className={`text-[#6D6D6D] border-2 font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer 
      ${hasYoutubeUrl ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'hover:border-[#0092BA]'}`}
            >
              Selecionar arquivo
            </button>

            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="mt-2 text-sm text-[#6D6D6D] hover:text-red-600 cursor-pointer"
              >
                Remover arquivo
              </button>
            )}
          </div>


          <div className="mt-6">
            <p className="text-[16px] font-bold text-[#6D6D6D] mb-2">URL do YouTube</p>
            <div className="flex gap-2">
              <div className="relative w-full">
                <MdInsertLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />

                <input
                  type="url"
                  className={`w-full pl-10 rounded-lg text-[16px] px-[12px] font-normal border py-4 outline-none transition-colors duration-200 placeholder:text-gray-400
    ${hasVideo ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-[#6D6D6D] focus:border-[#0092BA]'}
`}
                  placeholder="Insira o link do YouTube"
                  value={youtubeUrl}
                  onChange={(e) => {
                    if (!hasVideo) {
                      setYoutubeUrl(e.target.value);
                    }
                  }}
                  disabled={hasVideo}
                />
              </div>
              {youtubeUrl && (
                <button
                  onClick={() => setYoutubeUrl("")}
                  className="mt-2 text-sm text-[#6D6D6D] hover:text-red-600 cursor-pointer"
                >
                  Remover URL
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#E6E6E6] rounded-lg shadow-xl p-6 relative gap-8">
          <h2 className="text-[28px] font-bold mb-4 text-[#515153]">Detalhes</h2>
          <p className="text-[18px] font-light mb-4 text-[#6D6D6D]">Escolha um título e uma descrição da sua aula</p>
          <div>
            <p className="text-[16px] font-bold text-[#6D6D6D] mb-2">ID da Aula</p>
            <input
              type="number"
              min="1"
              className="w-full rounded-lg text-[16px] px-[12px] font-normal border border-[#6D6D6D] py-4 focus:border-[#0092BA] outline-none transition-colors duration-200 placeholder:text-gray-400"
              placeholder="Ex: 123"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value === "" ? "" : Number(e.target.value))}
            />

            <p className="text-[16px] font-bold text-[#6D6D6D] mt-6 mb-2">Título</p>
            <input
              type="text"
              className="w-full rounded-lg text-[16px] px-[12px] font-normal border border-[#6D6D6D] py-4 focus:border-[#0092BA] outline-none transition-colors duration-200 placeholder:text-gray-400"
              placeholder="Insira o Título do vídeo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />


            <div className="mt-6">
              <p className="text-[16px] font-bold text-[#6D6D6D] mb-2">
                URL da thumbnail
                <span><a
                  href="https://www.encurtador.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 font-normal text-[12px] underline hover:text-[#026B88]"
                >
                  (Use um encurtador de URL)
                </a>
                </span>
              </p>
              <div className="flex gap-2">
                <div className="relative w-full">
                  <MdInsertLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />

                  <input
                    type="url"
                    className="w-full pl-10 rounded-lg text-[16px] px-[12px] font-normal border py-4 outline-none transition-colors duration-200 placeholder:text-gray-400"
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="Insira o link da thumbnail"
                    value={thumbnail}
                  />
                </div>
                {thumbnail && (
                  <button
                    onClick={() => setThumbnail("")}
                    className="mt-2 text-sm text-[#6D6D6D] hover:text-red-600 cursor-pointer"
                  >
                    Remover URL
                  </button>
                )}
              </div>
            </div>

            <p className="text-[16px] font-bold text-[#6D6D6D] mt-6 mb-2">Descrição</p>
            <textarea
              className="w-full h-[200px] resize-none overflow-auto border rounded-lg p-3 text-[16px] focus:border-[#0092BA] outline-none font-normal"
              placeholder="Digite seu texto aqui..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
          </div>

          <div className="w-full p-6 bg-white rounded-xl shadow-sm">
            <p className="text-xl font-semibold text-[#4B5563] mb-4">Categorias e Tags sugeridas</p>

            {tagCategories.map((category) => (
              <div key={category.title} className="mb-6">
                <p className="font-medium text-[#374151] text-[15px] mb-2">
                  {category.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    const isDisabled = !isSelected && selectedTags.length >= maxTags;

                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        disabled={isDisabled}
                        className={`px-3 py-1 rounded-full text-sm border transition-all duration-200
                    ${isSelected
                            ? 'bg-[#0092BA] text-white border-[#0092BA] cursor-pointer'
                            : isDisabled
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-white text-[#0092BA] border-[#0092BA] hover:bg-[#f0f9fb] cursor-pointer'
                          }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-6">
              <p className="text-[16px] font-medium text-[#4B5563] mb-2">
                Tags selecionadas ({selectedTags.length} de {maxTags})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#0092BA] text-white text-sm px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="text-white font-bold hover:text-gray-200 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-[#0092BA] text-white text-[18px] p-4 rounded-lg cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? 'Criando aula...' : (videoId ? 'Salvar alterações' : 'Criar aula')}
        </button>
      </div>
    </div>
  );
}

