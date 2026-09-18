import { Metadata } from 'next';
import { RespaldosView } from '@/features/administracion/respaldos';

export const metadata: Metadata = {
  title: 'Respaldos',
  description: 'Historial de publicaciones de página y vista previa de versiones anteriores',
};

export default function RespaldosPage() {
  return <RespaldosView />;
}
