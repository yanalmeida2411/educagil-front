import Link from "next/link";


export default function TeacherMain() {
  return (
    <main className="flex flex-col items-center justify-center w-full py-10">
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full max-w-7xl">
        <img
          src="/assets/svg/imgHero.svg"
          alt="Imagem Hero"
          className="w-full max-w-[300px] sm:max-w-md lg:max-w-lg transition-all duration-300 ease-in-out"
        />

        <div className="flex flex-col justify-center gap-4 text-center lg:text-left">
          <h2 className="text-xl sm:text-2xl lg:text-[28px]">
            Compartilhe seu saber com o mundo
          </h2>

          <p className="font-light text-base sm:text-lg lg:text-[18px] min-2xl:w-120 lg:w-100">
            Você tem o conhecimento e nós ajudamos a transformar isso em um curso engajante, do jeito certo e sem complicação.
          </p>

          <Link
            href="/classes" className="bg-[#0092BA] flex justify-center text-white text-base sm:text-lg font-semibold leading-6 px-6 py-3 rounded-lg hover:bg-[#007B9E] transition-colors cursor-pointer">
            Crie seu curso</Link>
        </div>
      </div>
    </main>
  );
}
