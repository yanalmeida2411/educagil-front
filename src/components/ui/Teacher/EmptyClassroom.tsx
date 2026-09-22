import React, { useState } from 'react';
import ModalClass from "./ModalClass";
export default function EmptyClassroom() {

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <main className="max-h-screen  flex flex-col font-sans font-semibold ">

            <section className="flex flex-col items-center justify-center w-full" >
                <div className="flex flex-col items-center justify-center gap-6 w-full max-w-7xl">
                    <img
                        src="/assets/svg/aulas.svg"
                        alt="Imagem Hero"
                        className="w-full sm:max-w-md"
                    />

                    <div className="flex flex-col justify-center gap-4 text-center lg:text-left">
                        <h2 className="text-xl sm:text-2xl lg:text-[18px]">
                            Nenhuma aula disponível
                        </h2>

                        <button
                            type="button"
                            onClick={openModal}
                            className="bg-[#0092BA] flex justify-center text-white text-base sm:text-lg font-semibold leading-6 px-6 py-3 rounded-lg hover:bg-[#007B9E] transition-colors cursor-pointer">
                            Criar aula</button>
                    </div>

                    {isModalOpen && <ModalClass onClose={closeModal}/>}


                </div>
            </section>
        </main>
    );
}

