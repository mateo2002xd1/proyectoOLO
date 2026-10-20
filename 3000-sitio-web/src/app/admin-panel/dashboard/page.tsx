import { Metadata } from 'next';
import { PanelGeneralDashboard } from '@/features/admin-panel/auth/components/panel-general';

export const metadata: Metadata = {
  title: 'Panel Administrativo',
  description: 'Panel de administración del Observatorio Laboral y Ocupacional',
};

export default function PanelGeneralPage() {
  return <PanelGeneralDashboard />;
}
