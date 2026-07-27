import React from 'react';
import { CalidadFormacionView } from '@/features/encuestas';

export const metadata = {
  title: 'Calidad de la Formación | Intranet',
  description: 'Resultados de la encuesta de Calidad de la Formación',
};

export default function CalidadFormacionPage() {
  return <CalidadFormacionView />;
}
