import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppHeader from "../components/AppHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Directorio AR — Decisiones con respaldo para tu empresa",
  description: "Diagnóstico gratuito para PyMEs argentinas: descubrí si es momento de sumar un consejo asesor o directorio, y cómo armarlo.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#534AB7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
