import { TbVideoPlus } from "react-icons/tb";
import { MdOutlineLibraryBooks } from "react-icons/md";
import { BsPeople } from "react-icons/bs";
import Link from "next/link";
import Sidebar from "../../components/layout/Sidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <Sidebar />
      </div>

      <div className="h-16 md:h-20"></div>

      {/* Main Content */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-[100px] py-6 md:py-10">
        {/* Saudações */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#053347]">
            Materiais
          </h1>
          <p className="text-sm sm:text-base text-[#053347] mb-4 sm:mb-8">
            Aqui está o resumo das suas principais atividades
          </p>
        </div>
      </section>
    </main>
  );
}
