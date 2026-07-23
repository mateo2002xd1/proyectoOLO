import axios from 'axios';
import type { IdentidadVisual } from '../types';
import { defaultIdentidadVisual } from '../lib/default-identidad-visual';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
});

export async function obtenerIdentidadVisual(): Promise<IdentidadVisual> {
  try {
    const { data } = await api.get('/api/identidad-visual');
    return { ...defaultIdentidadVisual, ...data };
  } catch {
    return defaultIdentidadVisual;
  }
}
