'use client'
import { useUserInfoFromCookies } from '@/hooks/useUserFromCookies';
import FooterAplication from "../../components/layout/FooterAplication";
import SidebarAplication from "@/components/layout/Teacher/SidebarTeacher";
import SidebarStudent from "@/components/layout/Student/SidebarStudent";
import StudentComingSoon from '@/components/student/StudentComingSoon';

export default function Cummunity() {

  const { full_name, user_type } = useUserInfoFromCookies();

  return (
    <section className="min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50">
        {user_type === 'T' && <SidebarAplication />}
        {user_type === 'S' && <SidebarStudent />}
      </header>
      <main className="flex flex-grow justify-center items-center font-sans">
        <div className="container mt-30 px-4 sm:px-8 md:px-16 lg:px-[104px] flex justify-center">

          {user_type === 'S' && <StudentComingSoon />}
        </div>
      </main>

      <footer className="w-full z-30 bg-white shadow-md mt-auto">
        <FooterAplication />
      </footer>
    </section>
  );
}