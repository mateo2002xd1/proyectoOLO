import { Metadata } from 'next';
import { AuditoriaView } from '@/features/administracion/auditoria';

export const metadata: Metadata = {
  title: 'Auditoría',
  description: 'Historial de cambios: quién hizo qué, sobre qué y cuándo',
};

export default function AuditoriaPage() {
  return <AuditoriaView />;
}
