import React from 'react';
import { CalidadFormacionView } from '@/features/encuestas/ui/calidad-de-formacion';

export const metadata = {
  title: 'Calidad de la Formación | Intranet',
  description: 'Resultados de la encuesta de Calidad de la Formación',
};

export default function CalidadFormacionPage() {
  return <CalidadFormacionView />;
}
