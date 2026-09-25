import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/style/globals.css";
import { COLOR_PWA, ICONO_APPLE, RegistrarServiceWorker } from "@/shared/lib/pwa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intranet | Observatorio Laboral y Ocupacional SENA",
  description: "Información restringida para publico interno del Observatorio Laboral y Ocupacional - SENA",
  icons: {
    icon: "/assets/svg/favicon.svg",
    apple: ICONO_APPLE,
  },
  // iOS no lee el manifiesto para esto: sin `appleWebApp`, «Agregar a inicio» abre
  // la intranet dentro de Safari, con su barra, en vez de a pantalla completa.
  appleWebApp: {
    capable: true,
    title: "Intranet OLO",
    statusBarStyle: "default",
  },
};

/** Color de la barra del navegador en el celular y de la app instalada. */
export const viewport: Viewport = {
  themeColor: COLOR_PWA,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
