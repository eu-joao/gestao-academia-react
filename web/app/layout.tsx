import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "@/app/app-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestão Academia",
  description: "Painel de gestão de alunos da academia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
