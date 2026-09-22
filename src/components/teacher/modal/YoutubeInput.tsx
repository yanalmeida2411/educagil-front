import React from "react";
import { MdInsertLink } from "react-icons/md";

interface YoutubeInputProps {
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  hasVideo: boolean; // controla se o input fica desabilitado
}

export default function YoutubeInput({ youtubeUrl, setYoutubeUrl, hasVideo }: YoutubeInputProps) {
  return (
    <div className="mt-6">
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
            onChange={(e) => {
              if (!hasVideo) setYoutubeUrl(e.target.value);
            }}
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
  );
}
