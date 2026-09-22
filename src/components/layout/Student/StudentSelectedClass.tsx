import React from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { FaFlag } from 'react-icons/fa'
import { FiDownload, FiHeart, FiPaperclip } from 'react-icons/fi'
import { MdArrowForward } from 'react-icons/md'

const StudentSelectedClass = () => {
    return (
        <>
            <main className='w-full h-full mt-20 flex flex-col items-center gap-8 px-3 mb-10 md:px-50'>
                <section className='w-full flex justify-start flex-1 items-center ml-2 gap-2 mt-5'>
                    <button className='text-[#026B88] text-[12px] md:text-[18px]'>Descobrindo o React</button>
                    <MdArrowForward className='w-5 h-5' />
                    <button className='text-[#026B88] text-[12px] md:text-[18px]'>Introdução ao React #1</button>
                </section>
                <section className='w-full flex flex-col gap-6 px-2 '>
                    <video className='flex flex-1 bg-gray-400 rounded-xl w-328 h-194 md:w-1411 md:h-878' controls >
                        {/* <source src="caminho/do/video.mp4" type="video/mp4"></source> */}
                    </video>
                    <p className='font-semibold text-[#333232] md:text-[28px]'>Introdução ao React #1</p>
                </section>
                <section className='w-full flex justify-start gap-3'>
                    <p className="flex items-center justify-center h-15 w-15 text-2xl rounded-full bg-[#0092BA] text-white font-medium">
                        E
                    </p>
                    <div className='w-1/2 flex flex-col justify-end'>
                        <p className='md:text-[18px]'>Prof Júlio Cesar</p>
                        <p className='text-[#6D6D6D] md:text-[16px]'>03 de Junho de 2025</p>
                    </div>
                </section>
                <section className='w-full relative mb-3'>
                    <h2 className='w-1/4 flex text-start absolute justify-center px-3 py-1 rounded-2xl bg-[#E9FAFF] text-[#0D4A60] text-sm md:w-25'>#React</h2>
                </section>
                <section className='w-full flex justify-between px-4 items-center relative'>
                    <p className='font-semibold md:text-[26px]'>Descrição</p>
                    <button className='flex gap-3 text-[12px] border-3 border-[#B0B0B0] text-[#6D6D6D] px-3 py-1 rounded-lg w-40 items-center justify-center font-bold 
                    md:absolute md:bottom-30 md:right-0'>
                        <FaFlag className='w-2 h-2' />
                        Reportar problema
                    </button>
                </section>
                <section className='p-4 bg-[#F2F2F4] rounded-xl md:w-full md:p-10'>
                    <p className='text-[12px] text-[#5B5B5D] md:text-[18px]'>
                        Nesta primeira aula, você dará os primeiros passos com o React,
                        uma das bibliotecas JavaScript mais utilizadas no desenvolvimento de interfaces modernas.
                        Vamos explorar os conceitos fundamentais como componentes,
                        JSX e estrutura básica de um projeto React. Ao final da aula,
                        você será capaz de criar sua primeira aplicação funcional e entender como o React
                        organiza e atualiza a interface de forma eficiente.
                    </p>
                </section>
                <section className='w-full flex flex-col'>
                    <h2 className='font-semibold mb-2 md:text-[26px]'>Materiais de Apoio</h2>
                    <div className='flex flex-col gap-4 md:flex-row md:justify-center md:gap-20'>
                        <div className='flex justify-around border border-[#E6E6E6] rounded-xl px-3 py-2 items-center text-[#333232]
                        md:w-1/3'>
                            <div className='hidden md:flex md:bg-[#E9FAFF] md:h-full md:w-1/5
                             md:items-center md:justify-center md:rounded-xl'>
                                <FiPaperclip className='w-5 h-5'/>
                            </div>
                            <div className='w-full ml-5'>
                                <p className='text-sm md:text-[16px]'>Slides</p>
                                <div className='flex gap-2 text-sm items-center mt-2 text-[#6D6D6D]'>
                                    <p>pdf</p>
                                    <BsCircleFill className='w-1 h-1' />
                                    <p>2,1MB</p>
                                </div>
                            </div>
                            <div>
                                <FiDownload className='text-[#0D4A60] w-4 h-4' />
                            </div>
                        </div>
                        <div className='flex justify-around border border-[#E6E6E6] rounded-xl px-3 py-2 items-center text-[#333232]
                        md:w-1/3'>
                            <div className='hidden md:flex md:bg-[#E9FAFF] md:h-full md:w-1/5
                             md:items-center md:justify-center md:rounded-xl'>
                                <FiPaperclip className='w-5 h-5'/>
                            </div>
                            <div className='w-full ml-5'>
                                <p className='text-sm md:text-[16px]'>Material</p>
                                <div className='flex gap-2 text-sm items-center mt-2 text-[#6D6D6D] '>
                                    <p>pdf</p>
                                    <BsCircleFill className='w-1 h-1' />
                                    <p>2,1MB</p>
                                </div>
                            </div>
                            <div>
                                <FiDownload className='text-[#0D4A60] w-4 h-4' />
                            </div>
                        </div>
                        <div className=' justify-around border border-[#E6E6E6] rounded-xl px-3 py-2 items-center text-[#333232]
                        md:w-1/3 hidden md:flex'>
                            <div className='hidden md:flex md:bg-[#E9FAFF] md:h-full md:w-1/5
                             md:items-center md:justify-center md:rounded-xl'>
                                <FiPaperclip className='w-5 h-5'/>
                            </div>
                            <div className='w-full ml-5 '>
                                <p className='text-sm md:text-[16px]'>Exercício</p>
                                <div className='flex gap-2 text-sm items-center mt-2 text-[#6D6D6D] '>
                                    <p>pdf</p>
                                    <BsCircleFill className='w-1 h-1' />
                                    <p>2,1MB</p>
                                </div>
                            </div>
                            <div>
                                <FiDownload className='text-[#0D4A60] w-4 h-4' />
                            </div>
                        </div>
                    </div>
                </section>
                <section className='w-full flex flex-col gap-4 '>
                    <h2 className='font-semibold md:text-[26px]'>Comentários</h2>
                    <div className='flex border border-[#E6E6E6] rounded-xl px-4 py-5 md:shadow'>
                        <p className='flex items-start text-sm text-[#B0B0B0] md:text-[18px] md:h-30
                        '>Adicione um comentário...</p>
                    </div>
                    <div className='flex md:justify-end'>
                        <button className='w-full flex justify-center items-center gap-2 rounded-xl py-2 font-semibold text-sm bg-[#E6E6E6] text-[#6D6D6D]
                        md:w-1/10 md:py-3 md:text-[16px]'>Enviar
                            <MdArrowForward className='w-4 h-4 hidden md:flex text-[#B0B0B0]' />
                        </button>
                    </div>

                </section>
                <section className='w-full flex flex-col gap-5 justify-center px-2'>
                    <div className='w-full flex items-center gap-3 md:border border-[#E6E6E6] rounded-2xl p-5 md:shadow'>
                        <div>
                            <p className="flex items-center justify-center h-10 w-10 rounded-full bg-[#0092BA] text-white font-medium">
                                E
                            </p>
                        </div>
                        <ul className='w-full flex flex-col'>
                            <li className='font-bold'>Carla Maria</li>
                            <li className='text-sm'>03 de Junho de 2025</li>
                            <li className='text-sm mt-1 italic'>
                                Essa introdução ao React me ajudou muito. Consegui resolver o exercício prático com facilidade!
                            </li>
                            <li>
                                <FiHeart className='text-[#0074D0] font-bold hidden md:flex md:mt-2 md:ml-2' />
                                <span className='text-sm text-[#0074D0] font-semibold hidden md:flex md:ml-2'>12</span>
                            </li>
                        </ul>
                        <div className='flex flex-col items-center'>
                            <FiHeart className='text-[#0074D0] w-4 h-4 md:hidden' />
                            <span className='text-sm text-[#0074D0] font-semibold md:hidden'>12</span>
                            <button className='text-[16px] text-[#515153] hidden md:flex md:mt-20'>Responder</button>
                        </div>

                    </div>
                    <div className='w-full flex items-center gap-3 md:border border-[#E6E6E6] rounded-2xl p-5 md:shadow'>
                        <div>
                            <p className="flex items-center justify-center h-10 w-10 rounded-full bg-[#0092BA] text-white font-medium">
                                E
                            </p>
                        </div>
                        <ul className='w-full flex flex-col'>
                            <li className='font-bold'>Jacob Jones</li>
                            <li className='text-sm'>03 de Junho de 2025</li>
                            <li className='text-sm mt-1 italic'>
                                A explicação sobre props ficou clara, mas ainda tenho dúvidas sobre quando usar props vs. state.
                            </li>
                            <li>
                                <FiHeart className='text-[#0074D0] font-bold hidden md:flex md:mt-2 md:ml-2' />
                            </li>
                        </ul>
                        <div>
                            <button className='text-[16px] text-[#515153] hidden md:flex md:mt-20'>Responder</button>
                            <FiHeart className='text-[#0074D0] font-bold md:hidden' />
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

export default StudentSelectedClass