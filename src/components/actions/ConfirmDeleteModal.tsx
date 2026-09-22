import React from 'react';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-[#e0dedea4] bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white  rounded-lg shadow-md  max-w-md text-start">
        <h2 className="text-xl font-semibold mb-4 px-8 py-4">Excluir esta aula?</h2>
        <div className="text-[#6D6D6D] font-normal flex flex-col gap-1 py-6 px-8">
          <p>Tem certeza de que deseja excluir este item? Essa ação não poderá ser desfeita.</p>

        </div>
        <div className="flex justify-end gap-7 px-6 py-4">
          <button
            className="cursor-pointer text-[#6D6D6D] hover:text-[#000000]"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-3 bg-[#EF3C5C] text-white rounded hover:bg-red-600 cursor-pointer"
            onClick={onConfirm}
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
