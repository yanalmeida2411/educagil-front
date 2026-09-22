import FooterAplication from "../../components/layout/FooterAplication";
//import SidebarAplication from "@/components/layout/SidebarAplication";

export default function Explorar() {
  return (
    <section className="min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50">
     {/* <SidebarAplication />*/}
      </header>

      <main className="flex-1 pt-[144px] px-4 sm:px-8 md:px-16 lg:px-[104px] font-sans font-semibold text-[#161616]">
        <div className="flex flex-col items-center justify-center w-full py-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full max-w-7xl">
            <div className="flex flex-col justify-center gap-4 text-center lg:text-left min-2xl:w-120">
              <h2 className="text-xl sm:text-2xl lg:text-[28px] text-center">
                Em breve, você poderá explorar um mundo novo</h2>

              <p className="font-light text-base sm:text-lg lg:text-[18px]">
                Cheio de descobertas, oportunidades e conhecimento ao seu alcance, o universo professor-aluno está pronto para surpreender você.
              </p>
            </div>
          </div>
        </div>


      </main>

      <footer className="w-full z-30 bg-white shadow-md mt-auto">
        <FooterAplication />
      </footer>
    </section>
  );
}
