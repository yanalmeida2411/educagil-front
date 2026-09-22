import React from 'react';

interface VideoUploaderProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  videoFileUrl: string;
  setVideoFileUrl: (url: string) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedFormats: string[];
  hasYoutubeUrl: boolean;
  clearFileError: () => void;
}

export default function VideoUploader({
  selectedFile,
  setSelectedFile,
  videoFileUrl,
  setVideoFileUrl,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  acceptedFormats,
  hasYoutubeUrl,
  clearFileError
}: VideoUploaderProps) {
  function getFileNameFromUrl(url: string): string {
    return decodeURIComponent(url.split('/').pop() ?? '');
  }

  return (
    <div
      onDragOver={!hasYoutubeUrl ? onDragOver : undefined}
      onDragLeave={!hasYoutubeUrl ? onDragLeave : undefined}
      onDrop={!hasYoutubeUrl ? onDrop : undefined}
      className={`border-2 border-dashed rounded-lg p-10 text-center flex flex-col items-center justify-center h-[400px] transition-colors duration-200
        ${isDragOver && !hasYoutubeUrl ? 'border-[#0092BA] bg-[#E0F7FA]' : 'border-gray-300 bg-gray-50'}
        ${hasYoutubeUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#0092BA] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>

      {selectedFile ? (
        <p className="text-lg text-gray-700 mb-1">
          Arquivo selecionado: <span className="font-semibold">{selectedFile.name}</span>
        </p>
      ) : videoFileUrl ? (
        <div className="text-md text-gray-700 mb-1">
          Arquivo atual: <span className="font-semibold text-[#0092BA]">{getFileNameFromUrl(videoFileUrl)}</span>
          <button
            onClick={() => {
              setVideoFileUrl('');
              setSelectedFile(null);
              clearFileError();
            }}
            className="ml-2 text-sm text-red-600 hover:underline"
          >
            Substituir arquivo
          </button>
        </div>
      ) : (
        <p className="text-lg text-gray-700 mb-1">Arraste o arquivo aqui</p>
      )}

      <p className="text-sm text-gray-500 mb-4">Formatos aceitos: {acceptedFormats.join(', ')}</p>

      <input
        type="file"
        id="video-upload-input"
        accept={acceptedFormats.map(ext => `.${ext}`).join(',')}
        onChange={onFileChange}
        className="hidden"
        disabled={hasYoutubeUrl}
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
  );
}
