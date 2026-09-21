import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import '@/style/globals.css';
import { SCRIPT_TEMA_ANTES_DE_PINTAR, SincronizarTema } from '@/shared/lib/tema';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={workSans.variable} suppressHydrationWarning>
      <head>
        {/* Tema antes de pintar, y solo en el panel: ver `shared/lib/tema/tema.ts`. */}
        <script
          id="anti-flash-theme"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_ANTES_DE_PINTAR }}
        />
      </head>
      <body>
        {children}
        <SincronizarTema />
      </body>
    </html>
  );
}
