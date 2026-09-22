import React from 'react';

interface SubmitButtonProps {
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
  videoId?: number | null;
}

export default function SubmitButton({ isLoading, onClick, disabled, videoId }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="bg-[#0092BA] text-white text-[18px] p-4 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      {isLoading ? (videoId ? 'Salvando alterações...' : 'Criando aula...') : (videoId ? 'Salvar alterações' : 'Criar aula')}
    </button>
  );
}
