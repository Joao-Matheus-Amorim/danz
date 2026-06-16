import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${BRAND.system} — ${BRAND.fullName}`,
  description:
    "Central operacional interna da DL (Dental Lead): CRM, boards, calendário, briefings, campanhas, arquivos e a IA DLtinho.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
