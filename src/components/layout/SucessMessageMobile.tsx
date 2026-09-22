'use client'

import { useEffect, useState } from 'react';
import { MdCheck, MdClose } from 'react-icons/md';

type Props = {
  message: string;
  duration?: number;
  onClose?: () => void;
};

export default function SuccessAlertMobile({ message, duration = 3000, onClose }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative bg-white rounded-2xl p-6 text-center shadow-lg max-w-xs w-full">
        
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          aria-label="Fechar"
        >
          <MdClose className="w-5 h-5 cursor-pointer" />
        </button>
        <div className="flex justify-center mb-4">
          <div className="bg-green-700 rounded-full p-2">
            <MdCheck className="text-white w-6 h-6" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Sucesso!</h2>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

