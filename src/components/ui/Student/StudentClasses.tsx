'use client';
import { FiVideo } from "react-icons/fi";
import { useState } from 'react';

export default function StudentClasses() {
    const [value1] = useState(50);
    const [value2] = useState(10);
    const [value3] = useState(30);

    return (
        <section className="w-full max-w-[1440px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <section>
                <h2 className="text-2xl sm:text-3xl lg:text-[28px] font-semibold mb-3">
                    Seus cursos
                </h2>
                <p className="font-light text-base sm:text-lg lg:text-[18px] mb-3">
                    Acesse seus últimos cursos iniciados
                </p>
                <button className="cursor-pointer font-bold underline text-[#6D6D6D] sm:text-lg lg:text-[18px] mb-6 text-[18px]">
                    Acessar todos os seus cursos
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <div className=" border border-[#B0B0B0] rounded-3xl px-[32] py-6 text-[18px]">
                            <div>
                                <p className="font-light text-sm mb-4">
                                    Curso
                                </p>

                                <h3 className="text-base font-medium mb-4 ">Tudo sobre o SCRUM</h3>
                                <label className="block text-gray-700 font-light mb-2 text-[16px]">
                                    Seu progresso <p className="mt-2 text-[12px]">{value1}%</p>
                                </label>
                                <input
                                    id="progress"
                                    type="range"
                                    className="w-full h-2 rounded-lg appearance-none"
                                    style={{
                                        background: `linear-gradient(to right, #026B88 ${value1}%, #C2BFBF ${value1}%)`,
                                    }}
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button className="border-2 border-[#B0B0B0] px-3 py-2 rounded-[8] text-[12px] gap-2 text-[#6D6D6D] cursor-pointer">
                                    Continuar aprendendo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className=" border border-[#B0B0B0] rounded-3xl px-[32] py-6 text-[18px]">
                            <div>
                                <p className="font-light text-sm mb-4">
                                    Curso
                                </p>

                                <h3 className="text-base font-medium mb-4 ">Design Thinking</h3>
                                <label className="block text-gray-700 font-light mb-2 text-[16px]">
                                    Seu progresso <p className="mt-2 text-[12px]">{value2}%</p>
                                </label>
                                <input
                                    id="progress"
                                    type="range"
                                    className="w-full h-2 rounded-lg appearance-none"
                                    style={{
                                        background: `linear-gradient(to right, #026B88 ${value2}%, #C2BFBF ${value2}%)`,
                                    }}
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button className="border-2 border-[#B0B0B0] px-3 py-2 rounded-[8] text-[12px] gap-2 text-[#6D6D6D] cursor-pointer">
                                    Continuar aprendendo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className=" border border-[#B0B0B0] rounded-3xl px-[32] py-6 text-[18px]">
                            <div>
                                <p className="font-light text-sm mb-4">
                                    Curso
                                </p>

                                <h3 className="text-base font-medium mb-4 ">Introdução a Programação</h3>
                                <label className="block text-gray-700 font-light mb-2 text-[16px]">
                                    Seu progresso <p className="mt-2 text-[12px]">{value3}%</p>
                                </label>
                                <input
                                    id="progress"
                                    type="range"
                                    className="w-full h-2 rounded-lg appearance-none"
                                    style={{
                                        background: `linear-gradient(to right, #026B88 ${value3}%, #C2BFBF ${value3}%)`,
                                    }}
                                />
                            </div>

                            <div className="flex justify-end mt-8">
                                <button className="border-2 border-[#B0B0B0] px-3 py-2 rounded-[8] text-[12px] gap-2 text-[#6D6D6D] cursor-pointer">
                                    Continuar aprendendo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <h2 className="text-2xl sm:text-3xl lg:text-[28px] font-semibold mb-3 mt-10">
                    Suas trilhas de aprendizado
                </h2>
                <p className="font-light text-base sm:text-lg lg:text-[18px] mb-3">
                    Continue trilhando seu aprendizado
                </p>
                <button className="cursor-pointer font-bold underline text-[#6D6D6D] sm:text-lg lg:text-[18px] mb-6 text-[18px]">
                    Acessar todas as suas trilhas
                </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <div className=" border border-[#B0B0B0] rounded-3xl px-[32] py-6 text-[18px]">
                        <div>
                            <p className="font-light text-sm mb-4">
                                Trilha
                            </p>

                            <h3 className="text-base font-medium mb-4 ">Métodos Ágeis</h3>
                            <label className="block text-gray-700 font-light mb-2 text-[16px]">
                                Seu progresso <p className="mt-2 text-[12px]">{value3}%</p>
                            </label>
                            <input
                                id="progress"
                                type="range"
                                className="w-full h-2 rounded-lg appearance-none"
                                style={{
                                    background: `linear-gradient(to right, #026B88 ${value3}%, #C2BFBF ${value3}%)`,
                                }}
                            />
                        </div>

                        <div className="flex justify-end mt-8">
                            <button className="border-2 border-[#B0B0B0] px-3 py-2 rounded-[8] text-[12px] gap-2 text-[#6D6D6D] cursor-pointer">
                                Continuar aprendendo
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className=" border border-[#B0B0B0] rounded-3xl px-[32] py-6 text-[18px]">
                        <div>
                            <p className="font-light text-sm mb-4">
                                Trilha
                            </p>

                            <h3 className="text-base font-medium mb-4 ">Comunicação Assertiva</h3>
                            <label className="block text-gray-700 font-light mb-2 text-[16px]">
                                Seu progresso <p className="mt-2 text-[12px]">{value1}%</p>
                            </label>
                            <input
                                id="progress"
                                type="range"
                                className="w-full h-2 rounded-lg appearance-none"
                                style={{
                                    background: `linear-gradient(to right, #026B88 ${value1}%, #C2BFBF ${value1}%)`,
                                }}
                            />
                        </div>

                        <div className="flex justify-end mt-8">
                            <button className="border-2 border-[#B0B0B0] px-3 py-2 rounded-[8] text-[12px] gap-2 text-[#6D6D6D] cursor-pointer">
                                Continuar aprendendo
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className=" border border-[#B0B0B0] rounded-3xl px-[32] py-6 text-[18px]">
                        <div>
                            <p className="font-light text-sm mb-4">
                                Trilha
                            </p>

                            <h3 className="text-base font-medium mb-4 ">Introdução a Programação</h3>
                            <label className="block text-gray-700 font-light mb-2 text-[16px]">
                                Seu progresso <p className="mt-2 text-[12px]">{value2}%</p>
                            </label>
                            <input
                                id="progress"
                                type="range"
                                className="w-full h-2 rounded-lg appearance-none"
                                style={{
                                    background: `linear-gradient(to right, #026B88 ${value2}%, #C2BFBF ${value2}%)`,
                                }}
                            />
                        </div>

                        <div className="flex justify-end mt-8">
                            <button className="border-2 border-[#B0B0B0] px-3 py-2 rounded-[8] text-[12px] gap-2 text-[#6D6D6D] cursor-pointer">
                                Continuar aprendendo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </section>
        </section>
    );
}