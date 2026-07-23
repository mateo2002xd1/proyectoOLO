import React from 'react';
import { SeguimientoLaboralView } from '@/features/encuestas/iu/seguimiento-laboral';

export const metadata = {
  title: 'Seguimiento Laboral | Intranet',
  description: 'Resultados de la encuesta de Seguimiento Laboral',
};

export default function SeguimientoLaboralPage() {
  return <SeguimientoLaboralView />;
}
