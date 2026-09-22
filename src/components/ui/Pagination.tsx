'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  className = '',
}) => {
  return (
    <div className={`flex justify-end items-center gap-6 py-3 text-gray-600 text-lg select-none ${className}`}>
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
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
        disabled={currentPage === totalPages}
        className="disabled:text-gray-300 hover:text-gray-800 disabled:cursor-not-allowed cursor-pointer"
      >
        &#8250;
      </button>
    </div>
  );
};

export default Pagination;
