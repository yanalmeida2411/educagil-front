'use client';
import { FaArrowLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function Return() {
    const router = useRouter();

    return (
        <div>
            <button
            onClick={() => router.back()}
            className='flex  items-center gap-2 text-[#6D6D6D]  m-[24px] ml-[104px] max-md:ml-[16px] cursor-pointer'
        >
            <FaArrowLeft />
          <p className="block max-md:hidden"> Voltar</p> 
        </button>
        </div>
            );
}
