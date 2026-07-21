import React from 'react';
import { TasaView } from '@/features/tasa/ui/TasaView';

export const metadata = {
  title: 'Tasa de Vinculación y Empleabilidad',
  description: 'Estadísticas de Tasa de Vinculación y Empleabilidad del SENA',
};

export default function TasaPage() {
  return <TasaView />;
}