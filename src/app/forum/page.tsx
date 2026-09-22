import SidebarAplication from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <SidebarAplication />
      </div>

      <div className="h-16 md:h-20"></div>
      <section className="px-4 sm:px-6 md:px-10 lg:px-[100px] py-6 md:py-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#053347]">
            Fóruns
          </h1>
          <p className="text-sm sm:text-base text-[#053347] mb-4 sm:mb-8">
            Aqui está o resumo das suas principais atividades
          </p>
        </div>
      </section>
    </main>
  );
}