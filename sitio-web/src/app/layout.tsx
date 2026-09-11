import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import '@/style/globals.css';

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
    <html lang="es" className={workSans.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          id="anti-flash-theme"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=document.documentElement.classList;c.add('no-transition');var s=localStorage.getItem('olo-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&d)){c.add('dark');}requestAnimationFrame(function(){requestAnimationFrame(function(){c.remove('no-transition');});});}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
