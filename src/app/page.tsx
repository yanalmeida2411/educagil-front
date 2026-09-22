'use client'
import TeacherTutorials from "../components/ui/Teacher/TeacherTutorials";
import TeacherMain from "../components/ui/Teacher/TeacherMain";
import FooterAplication from "../components/layout/FooterAplication";
import SidebarAplication from "@/components/layout/Teacher/SidebarTeacher";
import SidebarStudent from "@/components/layout/Student/SidebarStudent";
import StudentMain from "@/components/ui/Student/StudentMain";
import StudentClasses from "@/components/ui/Student/StudentClasses";
import { useUserInfoFromCookies } from '../hooks/useUserFromCookies';

export default function Home() {
  const { full_name, user_type } = useUserInfoFromCookies();
  return (
    <section className="min-h-screen flex flex-col text-amber-600">
      <header className="fixed top-0 w-full z-50">
        {user_type === 'T' && <SidebarAplication />}
        {user_type === 'S' && <SidebarStudent />}
      </header>

      <main className="flex-1 pt-[144px] px-4 sm:px-8 md:px-16 lg:px-[104px] font-sans font-semibold text-[#161616]">
        <h1 className="text-2xl sm:text-3xl lg:text-[40px] mb-8">
          Olá,{full_name || 'EducaAgil'}
        </h1>
        {user_type === 'T' && <TeacherMain />}
        {user_type === 'S' && <StudentMain />}
        {user_type === 'T' && <TeacherTutorials />}
        {user_type === 'S' && <StudentClasses />}
      </main>

      <footer className="w-full z-30 bg-white shadow-md mt-auto">
        <FooterAplication />
      </footer>
    </section>
  );
}

