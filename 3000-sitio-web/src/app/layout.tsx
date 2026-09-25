import type { Metadata, Viewport } from 'next';
import { Work_Sans } from 'next/font/google';
import '@/style/globals.css';
import { SincronizarTema } from '@/shared/lib/tema';
import { COLOR_PWA, ICONO_APPLE, RegistrarServiceWorker } from '@/shared/lib/pwa';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Observatorio Laboral y Ocupacional SENA',
  description:
    'Explora las ocupaciones clave de los sectores productivos en Colombia. El Observatorio Laboral y Ocupacional del SENA ofrece datos, análisis y publicaciones sobre el mercado laboral colombiano.',
  keywords: [
    'observatorio laboral',
    'ocupaciones colombia',
    'mercado laboral',
    'SENA',
    'empleo colombia',
    'formación profesional',
  ],
  icons: {
    icon: '/assets/logos/olo-logo-none.svg',
    apple: ICONO_APPLE,
  },
  // iOS no lee el manifiesto para esto: sin `appleWebApp`, «Agregar a inicio» abre
  // el sitio dentro de Safari, con su barra, en vez de a pantalla completa.
  appleWebApp: {
    capable: true,
    title: 'OLO SENA',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Observatorio Laboral y Ocupacional',
    description:
      'Datos y análisis del mercado laboral colombiano. Explora ocupaciones, sectores productivos y tendencias de empleo.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'Observatorio Laboral y Ocupacional — SENA',
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
    <html lang="es" className={workSans.variable} suppressHydrationWarning>
      <body>
        <SincronizarTema />
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
