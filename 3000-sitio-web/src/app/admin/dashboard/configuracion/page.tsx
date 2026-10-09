import { Metadata } from 'next';
import { ConfiguracionView } from '@/features/administracion/configuracion';

export const metadata: Metadata = {
  title: 'Configuración - Observatorio Laboral y Ocupacional',
};

export default function ConfiguracionPage() {
  return <ConfiguracionView />;
}
