'use client';

import Link from "next/link";

export default function Footer() {
    return (
        <header className="bg-[#E6E6E6] border-t-2 flex max-md:flex-col justify-between px-[104px] py-[24px] font-sans text-[#6D6D6D] font-light block max-md:hidden">
     <p>
                © 2025 Pipoca Ágil | <Link
                    href="https://pipocaagil.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold"
                >
                    pipocaagil.com.br
                </Link>
            </p>

            <p className="font-semibold">
                Precisa de ajuda?  <Link
                    href="https://pipocaagil.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-normal"
                >
                    Entre em contato pelo contato@pipocaagil.com.br
                </Link>
            </p>

        </header>
    );
}