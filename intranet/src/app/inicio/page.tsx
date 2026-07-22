import React from 'react';
import { InicioView } from '@/features/inicio/ui/InicioView';

export const metadata = {
  title: 'Inicio | Intranet',
  description: 'Inicio de la Intranet del Observatorio Laboral y Ocupacional SENA',
};

export default function InicioPage() {
  return <InicioView />;
}
