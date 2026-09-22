import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Moldura das telas de autenticação: formulário à esquerda e painel da marca
 * à direita, escondido no mobile para não roubar espaço do formulário.
 */
export function AuthLayout({
  children,
  illustration,
  headline,
  subline,
}: {
  children: ReactNode;
  illustration: string;
  headline: string;
  subline?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <Link href="/" className="mb-8 self-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático da marca */}
          <img src="/assets/svg/educAgilPadrao.svg" alt="Educagil" className="h-9 w-auto" />
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>

      <aside className="hidden bg-brand-600 lg:flex lg:flex-col lg:justify-center lg:gap-6 lg:p-12">
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustração estática da marca */}
        <img src={illustration} alt="" className="w-full max-w-md self-center" />

        <div className="max-w-md self-center text-center">
          <p className="text-lg font-medium text-white">{headline}</p>
          {subline && <p className="mt-2 text-brand-100">{subline}</p>}
        </div>
      </aside>
    </div>
  );
}
