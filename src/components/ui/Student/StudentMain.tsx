

export default function TeacherMain() {
  return (
    <main className="flex flex-col items-center justify-center w-full py-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full max-w-7xl">
            <img
              src="/assets/svg/imgHeroAluno.svg"
              alt="Imagem Hero"
              className="w-full max-w-[300px] sm:max-w-md lg:max-w-lg transition-all duration-300 ease-in-out"
            />

            <div className="flex flex-col justify-center gap-4 text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-[28px]">
                Seu espaço de aprendizado personalizado
              </h2>

              <p className="font-light text-base sm:text-lg lg:text-[18px] min-2xl:w-150 ">
                Aqui você acessa suas aulas, vê seu progresso e se conecta com outros alunos. Tudo em um só lugar!
              </p>

              <button className="background-blue-dark text-white text-base sm:text-lg font-semibold leading-6 px-6 py-3 rounded-lg  transition-colors cursor-pointer">
                Explorar cursos
              </button>
            </div>
          </div>
        </main>
  );
}
