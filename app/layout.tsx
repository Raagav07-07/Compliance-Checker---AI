import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Space_Grotesk } from "next/font/google";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Compliance Checker",
  description: "Upload and analyze policy documents"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen antialiased`}
      >
        <div
          className="
            fixed inset-0 -z-10
            bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,118,110,0.2),_transparent_60%),linear-gradient(120deg,_#f4f7fb,_#ecf6f4_40%,_#f8f4ec_100%)]
            bg-[length:240%_240%]
            animate-[aiGradient_16s_ease_infinite]
          "
        />
        <div className="fixed inset-0 -z-10 opacity-50">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl animate-[floatSoft_12s_ease-in-out_infinite]" />
          <div className="absolute top-1/4 right-[-6rem] h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl animate-[floatSoft_14s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-8rem] left-1/4 h-80 w-80 rounded-full bg-amber-300/35 blur-3xl animate-[floatSoft_16s_ease-in-out_infinite]" />
        </div>

        <div className="min-h-screen">
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Compliance Suite
                </span>
                <span className="text-xl font-semibold text-slate-900">AI Compliance Checker</span>
              </div>
              <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
                <Link className="transition hover:text-slate-900" href="/">
                  Overview
                </Link>
                <Link className="transition hover:text-slate-900" href="/compliance">
                  Compliance
                </Link>
                <Link className="transition hover:text-slate-900" href="/policies">
                  Policies
                </Link>
                <Link className="transition hover:text-slate-900" href="/reports">
                  Reports
                </Link>
                <Link className="transition hover:text-slate-900" href="/history">
                  History
                </Link>
                <Link className="transition hover:text-slate-900" href="/system">
                  System
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
