
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import ClientLayoutWrapper from '@/components/meta/ClientLayoutWrapper'; // Ajuste o caminho se necessário

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});


export const metadata: Metadata = {
  title: "Educagil",
  description: "Aprendizado ágil, prático e contínuo para mentes que acompanham a transformação.",
  icons: {
    icon: "/assets/svg/educAgilMini.svg",
    shortcut: "/assets/svg/educAgilProfessoresMini.svg",
    apple: "/assets/svg/educAgilProfessoresMini.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}