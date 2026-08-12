import axios from 'axios';
import { Ocupacion } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
});

export async function buscarOcupaciones(termino: string): Promise<Ocupacion[]> {
  if (!termino.trim()) return [];

  try {
    const { data } = await api.get('/api/ocupaciones/buscar', { params: { q: termino } });
    return data;
  } catch {
    return [];
  }
}
