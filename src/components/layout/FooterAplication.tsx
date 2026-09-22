'use client';

import Link from "next/link";

export default function FooterAplication() {
  return (
    <footer className="bg-[#E6E6E6] border-t-2 text-[#6D6D6D] font-sans font-light px-6 sm:px-10 lg:px-[104px] py-6">
      <div className="flex flex-col items-center justify-center gap-2 text-center text-sm sm:flex-row sm:justify-between sm:items-center">
        
        <p className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
          <span>© 2025 Pipoca Ágil | </span>
          <Link
            href="https://pipocaagil.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            pipocaagil.com.br
          </Link>
        </p>

        <p className="text-sm sm:text-right hidden [@media(min-width:426px)]:block">
  <span className="font-semibold">Precisa de ajuda?</span>{' '}
  <Link
    href="mailto:contato@pipocaagil.com.br"
    className="font-normal underline"
  >
    contato@pipocaagil.com.br
  </Link>
</p>
      </div>
    </footer>
  );
}
