'use client'
import SidebarAplication from "@/components/layout/Teacher/SidebarTeacher";
import FooterAplication from "../../components/layout/FooterAplication";
import { useUserInfoFromCookies } from '@/hooks/useUserFromCookies';
import VideoTable from "@/components/teacher/classes/VideoTable";
import SidebarStudent from "@/components/layout/Student/SidebarStudent";
import StudentSelectedClass from "@/components/layout/Student/StudentSelectedClass";



export default function Classes() {
  const { user_type } = useUserInfoFromCookies();

  return (
    <section className="min-h-screen flex flex-col ">

       <header className="fixed top-0 w-full z-50">
              {user_type === 'T' && <SidebarAplication />}
              {user_type === 'S' && <SidebarStudent />}
            </header>

      <main className="flex flex-grow justify-center items-center font-sans">

        <div className="container mt-30 px-4 sm:px-8 md:px-16 lg:px-[104px] flex justify-center">
          {user_type === 'T' && <VideoTable />}
          {user_type === 'S' && <StudentSelectedClass />}
        </div>

      </main>
      <footer className="w-full  bg-white shadow-md mt-auto">
        <FooterAplication />
      </footer>
    </section>
  );
}
