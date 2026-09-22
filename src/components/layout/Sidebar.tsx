"use client";

import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between py-2 px-4 sm:px-6 md:px-10 lg:px-[100px] bg-white shadow">
      <div className="text-[28px] sm:text-[32px] md:text-[40px] leading-[46px] tracking-[-0.02em] font-semibold font-inter text-[#0092BA]">
        <img
          src="/assets/svg/educAgilPadrao.svg"
          alt="Logo"
          className="w-28 sm:w-32 md:w-36"
        />
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#053347]"
        >
          {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
        <Link
          href="/"
          className="text-sm lg:text-base font-semibold text-[#053347] hover:underline"
        >
          Home
        </Link>
        <Link
          href="/publish"
          className="text-sm lg:text-base font-semibold text-[#053347] hover:underline"
        >
          Publicar
        </Link>
        <Link
          href="/forum"
          className="text-sm lg:text-base font-semibold text-[#053347] hover:underline"
        >
          Fórum
        </Link>
        <Link
          href="/materials"
          className="text-sm lg:text-base font-semibold text-[#053347] hover:underline"
        >
          Materiais
        </Link>
      </nav>

      <div className="hidden sm:flex items-center gap-3">
        <img
          src="/assets/user.jpg"
          alt="User"
          className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full"
        />
        <span className="text-sm md:text-base font-semibold text-[#053347]">
          João Silva
        </span>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-md p-4 z-50 md:hidden">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-base font-semibold text-[#053347] hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/publish"
              className="text-base font-semibold text-[#053347] hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Publicar
            </Link>
            <Link
              href="/forum"
              className="text-base font-semibold text-[#053347] hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fórum
            </Link>
            <Link
              href="/materials"
              className="text-base font-semibold text-[#053347] hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              Materiais
            </Link>

            <div className="sm:hidden flex items-center gap-3 pt-4 border-t">
              <img
                src="/assets/user.jpg"
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm font-semibold text-[#053347]">
                João Silva
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
