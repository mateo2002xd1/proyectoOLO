import { Metadata } from 'next';
import { PoliticaPrivacidadView } from '@/features/sitio-web/politica-privacidad';

export const metadata: Metadata = {
  title: 'Política de Privacidad | SENA OLO',
  description:
    'Política de Privacidad y Tratamiento de Datos Personales del Observatorio Laboral y Ocupacional del SENA.',
};

export default function PrivacidadAliasPage() {
  return <PoliticaPrivacidadView />;
}
