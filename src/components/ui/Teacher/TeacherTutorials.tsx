'use client';
import { FiVideo } from "react-icons/fi";
import { TbUpload } from "react-icons/tb";

export default function TeacherTutorials() {
  return (
    <section className="w-full max-w-[1440px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl lg:text-[28px] font-semibold mb-3">
        Não sabe por onde começar? Sem problemas!
      </h2>
      <p className="font-light text-base sm:text-lg lg:text-[18px] mb-8">
        Temos tutoriais para ajudar a montar suas aulas
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
   
        <div className="flex items-center gap-4 border rounded-3xl px-6 py-6 hover:shadow-md transition-shadow cursor-pointer max-w-[400px]">
          <FiVideo className="w-10 h-10 max-md:w-6 max-md:h-6 text-[#026B88] flex-shrink-0" />
          <div>
            <h3 className="text-base font-medium mb-1">Comece a gravar!</h3>
            <p className="font-light text-sm">
              Aprenda o básico de como gravar uma aula.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border rounded-3xl px-6 py-6 hover:shadow-md transition-shadow cursor-pointer max-w-[400px]">
          <TbUpload className="w-10 h-10 max-md:w-6 max-md:h-6 text-[#026B88] flex-shrink-0" />
          <div>
            <h3 className="text-base font-medium mb-1">Upload de vídeos</h3>
            <p className="font-light text-sm">
              Faça upload de maneira fácil e rápida.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border rounded-3xl px-6 py-6 hover:shadow-md transition-shadow cursor-pointer max-w-[400px]">
          <img
            src="/assets/svg/library.svg"
            alt="Ícone de biblioteca"
            className="w-10 h-10 max-md:w-6 max-md:h-6 flex-shrink-0"
          />
          <div>
            <h3 className="text-base font-medium mb-1">Materiais complementares</h3>
            <p className="font-light text-sm">
              Adicione recursos extras às suas aulas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
