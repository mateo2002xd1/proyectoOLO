import type { RegistroRespaldo } from '../types';

/**
 * Datos de ejemplo mientras no exista el endpoint real.
 *
 * `listarRespaldos` ya tiene la forma async que tendrá la llamada a la API
 * (`GET /api/paginas/respaldos` o similar), para que conectar el backend más
 * adelante sea cambiar el cuerpo de esta función y no el resto de la feature.
 */
const REGISTROS_DE_EJEMPLO: RegistroRespaldo[] = [
  {
    id: 'resp-1',
    paginaId: 'pag-inicio',
    titulo: 'Inicio',
    slug: 'inicio',
    numeroVersion: 5,
    versionAnteriorNumero: 4,
    editadoPor: { id: 'u-1', nombre: 'Laura Gómez', email: 'laura.gomez@olo.com' },
    publicadoPor: { id: 'u-2', nombre: 'Carlos Pérez', email: 'carlos.perez@olo.com' },
    editadoEn: '2026-08-28T14:32:00-05:00',
    publicadoEn: '2026-08-28T16:10:00-05:00',
  },
  {
    id: 'resp-2',
    paginaId: 'pag-clasificacion',
    titulo: 'Clasificación',
    slug: 'clasificacion',
    numeroVersion: 3,
    versionAnteriorNumero: 2,
    editadoPor: { id: 'u-3', nombre: 'Diego Rojas', email: 'diego.rojas@olo.com' },
    publicadoPor: { id: 'u-2', nombre: 'Carlos Pérez', email: 'carlos.perez@olo.com' },
    editadoEn: '2026-08-20T09:15:00-05:00',
    publicadoEn: '2026-08-20T11:00:00-05:00',
  },
  {
    id: 'resp-3',
    paginaId: 'pag-privacidad',
    titulo: 'Política de privacidad',
    slug: 'politica-de-privacidad',
    numeroVersion: 2,
    versionAnteriorNumero: 1,
    editadoPor: { id: 'u-4', nombre: 'Ana Martínez', email: 'ana.martinez@olo.com' },
    publicadoPor: { id: 'u-4', nombre: 'Ana Martínez', email: 'ana.martinez@olo.com' },
    editadoEn: '2026-07-12T10:05:00-05:00',
    publicadoEn: '2026-07-12T10:40:00-05:00',
  },
  {
    id: 'resp-4',
    paginaId: 'pag-menu-pie',
    titulo: 'Menú y pie',
    slug: 'menu-y-pie',
    numeroVersion: 4,
    versionAnteriorNumero: 3,
    editadoPor: { id: 'u-5', nombre: 'María Fernanda Ruiz', email: 'maria.ruiz@olo.com' },
    publicadoPor: { id: 'u-2', nombre: 'Carlos Pérez', email: 'carlos.perez@olo.com' },
    editadoEn: '2026-08-30T08:47:00-05:00',
    publicadoEn: '2026-08-30T09:20:00-05:00',
  },
  {
    id: 'resp-5',
    paginaId: 'pag-publicaciones',
    titulo: 'Publicaciones',
    slug: 'publicaciones',
    numeroVersion: 1,
    versionAnteriorNumero: null,
    editadoPor: { id: 'u-3', nombre: 'Diego Rojas', email: 'diego.rojas@olo.com' },
    publicadoPor: { id: 'u-4', nombre: 'Ana Martínez', email: 'ana.martinez@olo.com' },
    editadoEn: '2026-06-02T13:00:00-05:00',
    publicadoEn: '2026-06-02T13:30:00-05:00',
  },
];

/** Simula la latencia de red para que el estado de carga se vea igual que con la API real. */
export async function listarRespaldos(): Promise<RegistroRespaldo[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return REGISTROS_DE_EJEMPLO;
}
