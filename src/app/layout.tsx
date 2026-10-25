import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swan TaskFlow | Production Task Management System",
  description:
    "Production-style Task Management System built for Swan Digital Solutions with Role-Based Access Control, Drag-and-Drop Kanban, Real-time Dashboard, and REST API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
