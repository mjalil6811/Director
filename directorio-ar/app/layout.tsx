import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AppHeader from "../components/AppHeader";
import { SITE_URL, SITIO } from "../lib/sitio";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITIO.titulo, template: `%s · ${SITIO.nombre}` },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITIO.nombre,
    locale: "es_AR",
    title: SITIO.titulo,
    description: SITIO.descripcion,
  },
  twitter: {
    card: "summary_large_image",
    title: SITIO.titulo,
    description: SITIO.descripcion,
  },
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
    <html lang="es-AR" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        <AppHeader />
        {children}
        {/* Analítica sin cookies. Los eventos personalizados se envían desde lib/analitica.ts */}
        <Analytics />
      </body>
    </html>
  );
}
