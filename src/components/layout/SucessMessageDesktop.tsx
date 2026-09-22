'use client'

import { useEffect, useState } from 'react';
import { MdCheckCircle, MdClose } from 'react-icons/md';

type Props = {
    message: string;
    duration?: number;
    onClose?: () => void;
};

export default function SuccessMessageDesktop({ message, duration = 3000, onClose }: Props) {
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
        <div className="fixed top-35 right-6 w-[360px] h-[60px] bg-[#DFF5E1] border border-[#B5E5BE] text-[#1E4620] rounded-md shadow flex items-center justify-between px-4 py-3 animate-fade-in">
            <div className="flex items-center gap-3">
                <MdCheckCircle className="text-[#1E4620] w-5 h-5" />
                <span className="text-sm font-medium">{message}</span>
            </div>
            <button
                className="text-xl text-[#1E4620] hover:text-[#14532d] leading-none"
                onClick={() => {
                    setVisible(false);
                    onClose?.();
                }}
            >
                <MdClose className="w-5 h-5 cursor-pointer" />
            </button>
        </div>
    );
}