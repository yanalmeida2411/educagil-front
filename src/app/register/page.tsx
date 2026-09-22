"use client";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Footer from "../../components/layout/Footer";
import SidebarLoginRegister from "../../components/layout/SidebarLoginRegister";
import RegisterForm from "@/components/forms/RegisterForm";

export default function Register() {

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SidebarLoginRegister />
      <div className="flex-grow flex flex-col px-4 sm:px-6 md:px-10 lg:px-16 py-4 sm:py-6">
        <div className="block sm:hidden mb-4">
          <Link href="/">
            <FaArrowLeft size={24} className="text-gray-700" />
          </Link>
        </div>

        <div className="flex flex-col sm:items-center lg:flex-row items-center justify-center w-full max-w-7xl mx-auto pt-0 pb-24">
          <div className="hidden sm:flex w-full lg:w-1/2 items-center justify-center lg:pr-12 py-4 md:py-8">
            <img
              src="/assets/register-image.png"
              alt="Register Illustration"
              className="object-contain w-full sm:w-4/5 md:w-3/4 lg:w-auto max-h-[450px]"
            />
          </div>

          <div className="w-full sm:w-[90%] md:w-[85%] lg:w-1/2 max-w-md">
            <RegisterForm/>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-md">
        <Footer />
      </div>
    </div>
  );
}