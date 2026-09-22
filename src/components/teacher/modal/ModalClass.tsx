import React from 'react';
import { useModalClassLogic } from '@/hooks/useModalClassLogic';
import TagSelector from './TagSelector';
import ErrorAlert from './ErrorAlert';
import SubmitButton from './SubmitButton';
import { MdInsertLink } from 'react-icons/md';

interface ModalClassProps {
  onClose: () => void;
  videoId?: number | null;
  lessonId?: number | null;
  lessonDescription?: string;
}

export default function ModalClass({ onClose, videoId, lessonDescription }: ModalClassProps) {
  const {
    lessonId,
    setLessonId,
    desc,
    setDesc,
    title,
    setTitle,
    selectedFile,
    setSelectedFile,
    youtubeUrl,
    setYoutubeUrl,
    thumbnail,
    setThumbnail,
    isDragOver,
    videoFileUrl,
    setVideoFileUrl,
    isLoading,
    error,
    acceptedFormats,
    getFileNameFromUrl,
    selectedTags,
    maxTags,
    hasVideo,
    hasYoutubeUrl,
    toggleTag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleSubmit,
  } = useModalClassLogic({ videoId, lessonDescription });

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center flex-col mt-32">
      <div className="bg-white rounded-lg relative max-w-4xl w-full transform transition-all duration-300 scale-100 opacity-100">
        <div className="pb-4 border-b border-[#E6E6E6] flex justify-between items-center">
          <button
            onClick={onClose}
            className="absolute cursor-pointer right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            aria-label="Fechar modal"
          >
            ×
          </button>
          <div>
            <h2 className="text-[40px] font-bold text-[#161616]">{videoId ? 'Editar aula' : 'Criar aula'}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl w-full">

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
              <p className="text-[18px] text-[#515153] mb-1 font-semibold">Arraste o arquivo aqui</p>
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


        <div className="mt-6 w-full ">
          <p className="text-[16px] font-bold text-[#6D6D6D] mb-2">URL do YouTube</p>
          <div className="flex gap-2">
            <div className="relative w-full">
              <MdInsertLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
              <input
                type="url"
                className={`w-full pl-10 rounded-lg text-[16px] px-[12px] font-normal border py-4 outline-none transition-colors duration-200 placeholder:text-gray-400
                    ${hasVideo ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-[#6D6D6D] focus:border-[#0092BA]'}`}
                placeholder="Insira o link do YouTube"
                value={youtubeUrl}
                onChange={(e) => !hasVideo && setYoutubeUrl(e.target.value)}
                disabled={hasVideo}
              />
            </div>
            {youtubeUrl && (
              <button
                onClick={() => setYoutubeUrl("")}
                className="mt-2 text-sm text-[#6D6D6D] hover:text-red-600 cursor-pointer"
                type="button"
              >
                Remover URL
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border-2 border-[#E6E6E6] rounded-lg shadow-xl p-6 relative gap-8 max-w-4xl">
      {/*    <div>
            <label className="block text-[16px] font-bold text-[#6D6D6D] mb-2" htmlFor="lessonIdInput">
              ID da Aula
            </label>
            <input
              id="lessonIdInput"
              type="number"
              min={1}
              className="w-full rounded-lg text-[16px] px-[12px] font-normal border border-[#6D6D6D] py-4 focus:border-[#0092BA] outline-none transition-colors duration-200 placeholder:text-gray-400"
              placeholder="Ex: 123"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>*/}

          <div className="mt-6">
            <label className="block text-[16px] font-bold text-[#6D6D6D] mb-2" htmlFor="titleInput">
              Título
            </label>
            <input
              id="titleInput"
              type="text"
              className="w-full rounded-lg text-[16px] px-[12px] font-normal border border-[#6D6D6D] py-4 focus:border-[#0092BA] outline-none transition-colors duration-200 placeholder:text-gray-400"
              placeholder="Insira o Título do vídeo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <label className="block text-[16px] font-bold text-[#6D6D6D] mb-2" htmlFor="thumbnailInput">
              URL da thumbnail
              <a
                href="https://www.encurtador.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-normal text-[12px] underline hover:text-[#026B88]"
              >
                (Use um encurtador de URL)
              </a>
            </label>
            <div className="flex gap-2">
              <input
                id="thumbnailInput"
                type="url"
                className="w-full rounded-lg text-[16px] px-[12px] font-normal border py-4 outline-none transition-colors duration-200 placeholder:text-gray-400"
                placeholder="Insira o link da thumbnail"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
              {thumbnail && (
                <button
                  onClick={() => setThumbnail("")}
                  className="mt-2 text-sm text-[#6D6D6D] hover:text-red-600 cursor-pointer"
                  type="button"
                >
                  Remover URL
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[16px] font-bold text-[#6D6D6D] mb-2" htmlFor="descTextarea">
              Descrição
            </label>
            <textarea
              id="descTextarea"
              className="w-full h-[200px] resize-none overflow-auto border rounded-lg p-3 text-[16px] focus:border-[#0092BA] outline-none font-normal"
              placeholder="Digite seu texto aqui..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Tags */}
          <TagSelector
            tagCategories={[
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
            ]}
            selectedTags={selectedTags}
            maxTags={maxTags}
            toggleTag={toggleTag}
          />
        </div>

        
        <ErrorAlert message={error} />
        <SubmitButton
          isLoading={isLoading}
          onClick={() => handleSubmit(onClose, videoId)}
          disabled={isLoading}
          videoId={videoId}
        />
      </div>
    </div>
  );
}
