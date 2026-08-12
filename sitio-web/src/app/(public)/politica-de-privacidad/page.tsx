import { Metadata } from 'next';
import { PoliticaPrivacidadView } from '@/features/sitio-web/politica-privacidad';

export const metadata: Metadata = {
  title: 'Política de Seguridad y Privacidad de la Información | SENA OLO',
  description:
    'Consulte los lineamientos de seguridad, privacidad de la información, tratamiento y protección de datos personales (Ley 1581 de 2012) y el mapa de procesos institucional del Observatorio Laboral y Ocupacional del SENA.',
};

export default function PoliticaPrivacidadPage() {
  return <PoliticaPrivacidadView />;
}
