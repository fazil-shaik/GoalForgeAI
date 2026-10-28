import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoalForge AI — Turn Ambition Into Unstoppable Execution",
  description: "An adaptive goal-achievement platform that turns ambitions into realistic plans, tracks execution, and helps users recover when life gets in the way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
