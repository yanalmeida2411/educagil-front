"use client";
import SidebarLoginRegister from "../../components/layout/SidebarLoginRegister";
import Footer from "../../components/layout/Footer";
import LoginForm from "@/components/forms/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col">
      <SidebarLoginRegister />
      <div className="flex-grow flex flex-col px-4 sm:px-6 md:px-10 lg:px-16 py-6">
        <div className="flex flex-col sm:items-center lg:flex-row items-center justify-center w-full max-w-7xl mx-auto mt-4 sm:mt-32 md:mt-36 lg:mt-24">
          <div className="hidden sm:flex w-full lg:w-1/2 items-center justify-center mb-8 sm:mb-12 md:mb-16 lg:mb-0 lg:pr-12 py-4 md:py-8">
            <img
              src="/assets/login-image.png"
              alt="Login Illustration"
              style={{
                maxWidth: "100%",
                height: "auto",
                width: "auto",
                maxHeight: "450px",
              }}
              className="object-contain w-full sm:w-4/5 md:w-3/4 lg:w-auto"
            />
          </div>

          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 max-w-md lg:pl-4 xl:pl-12">
            <LoginForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}