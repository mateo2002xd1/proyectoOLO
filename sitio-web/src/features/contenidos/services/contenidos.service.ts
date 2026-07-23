import axios from 'axios';
import { Contenido } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 5000,
});

export async function listarContenidosPublicados(): Promise<Contenido[]> {
  try {
    const { data } = await api.get('/api/contenidos/publica');
    return data;
  } catch {
    return [];
  }
}
