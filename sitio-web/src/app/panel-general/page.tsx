import { Metadata } from 'next';
import { PanelGeneralDashboard } from '@/features/administracion/panel-general/components/panel-general';

export const metadata: Metadata = {
  title: 'Panel Administrativo',
  description: 'Panel de administración del Observatorio Laboral y Ocupacional',
};

export default function PanelGeneralPage() {
  return <PanelGeneralDashboard />;
}
