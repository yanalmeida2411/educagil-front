'use client';
import React from 'react';

interface BaseProps {
  totalPages: number;
  className?: string;
}

/** API atual: página controlada + callback com a página destino. */
interface ControlledProps extends BaseProps {
  page: number;
  onChange: (page: number) => void;
}

/** API antiga, ainda usada pela tabela de vídeos. */
interface LegacyProps extends BaseProps {
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
}

type PaginationProps = ControlledProps | LegacyProps;

const Pagination: React.FC<PaginationProps> = (props) => {
  const { totalPages, className = '' } = props;
  const currentPage = 'page' in props ? props.page : props.currentPage;
  const onPrevious = 'onChange' in props ? () => props.onChange(currentPage - 1) : props.onPrevious;
  const onNext = 'onChange' in props ? () => props.onChange(currentPage + 1) : props.onNext;

  return (
    <div className={`flex justify-end items-center gap-6 py-3 text-gray-600 text-lg select-none ${className}`}>
      <button
        onClick={onPrevious}
        disabled={currentPage <= 1}
        className="disabled:text-gray-300 hover:text-gray-800 disabled:cursor-not-allowed cursor-pointer"
      >
        &#8249;
      </button>

      <div className="flex items-center gap-2">
        <span className="font-medium">{currentPage}</span>
        <span className="text-gray-400">|</span>
        <span className="font-medium">{totalPages}</span>
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="disabled:text-gray-300 hover:text-gray-800 disabled:cursor-not-allowed cursor-pointer"
      >
        &#8250;
      </button>
    </div>
  );
};

export default Pagination;
