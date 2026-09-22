import React from 'react';

interface VideoDetailsFormProps {
  lessonId: number | "";
  setLessonId: (id: number | "") => void;
  title: string;
  setTitle: (title: string) => void;
  desc: string;
  setDesc: (desc: string) => void;
  thumbnail: string;
  setThumbnail: (thumb: string) => void;
}

export default function VideoDetailsForm({
  lessonId,
  setLessonId,
  title,
  setTitle,
  desc,
  setDesc,
  thumbnail,
  setThumbnail
}: VideoDetailsFormProps) {
  return (
    <div className="bg-white border-2 border-[#E6E6E6] rounded-lg shadow-xl p-6 relative gap-8 mt-6">
      <h2 className="text-[28px] font-bold mb-4 text-[#515153]">Detalhes</h2>
      <p className="text-[18px] font-light mb-4 text-[#6D6D6D]">Escolha um título e uma descrição da sua aula</p>

      <div>
        <label className="text-[16px] font-bold text-[#6D6D6D] mb-2 block">ID da Aula</label>
        <input
          type="number"
          min={1}
          className="w-full rounded-lg text-[16px] px-[12px] font-normal border border-[#6D6D6D] py-4 focus:border-[#0092BA] outline-none transition-colors duration-200 placeholder:text-gray-400"
          placeholder="Ex: 123"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value === "" ? "" : Number(e.target.value))}
        />

        <label className="text-[16px] font-bold text-[#6D6D6D] mt-6 mb-2 block">Título</label>
        <input
          type="text"
          className="w-full rounded-lg text-[16px] px-[12px] font-normal border border-[#6D6D6D] py-4 focus:border-[#0092BA] outline-none transition-colors duration-200 placeholder:text-gray-400"
          placeholder="Insira o Título do vídeo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="text-[16px] font-bold text-[#6D6D6D] mt-6 mb-2 block">
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
            type="url"
            className="w-full pl-3 rounded-lg text-[16px] px-[12px] font-normal border py-4 outline-none transition-colors duration-200 placeholder:text-gray-400"
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

        <label className="text-[16px] font-bold text-[#6D6D6D] mt-6 mb-2 block">Descrição</label>
        <textarea
          className="w-full h-[200px] resize-none overflow-auto border rounded-lg p-3 text-[16px] focus:border-[#0092BA] outline-none font-normal"
          placeholder="Digite seu texto aqui..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
    </div>
  );
}
