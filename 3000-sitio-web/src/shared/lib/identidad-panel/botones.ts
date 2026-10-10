/**
 * Los tipos de botón del panel (las variantes de `Button`, `shared/ui/atoms/button.tsx`) y su
 * color de fábrica. Desde el 2026-10-10 se cambian en Configuración → Identidad visual, igual
 * que las etiquetas de acción (`acciones.ts`): `EstilosDeIdentidad` escribe
 * `--olo-boton-{id}-fondo` y `-texto`, y `Button` los lee.
 *
 * **Los colores de fábrica están dos veces**: aquí, para la pantalla de Configuración, y como
 * respaldo dentro de cada `var()` de `button.tsx`. El respaldo hace falta porque `Button`
 * también sale fuera del panel (el acceso, el sitio público), donde no se escriben las
 * variables. Si se cambia uno, cambiar los dos.
 */

export type IdDeBoton =
  | 'principal'
  | 'secundario'
  | 'azul-oscuro'
  | 'principal-modal'
  | 'secundario-modal'
  | 'peligro'
  | 'verde';

export interface BotonDelPanel {
  id: IdDeBoton;
  nombre: string;
  dondeAparece: string;
  grupo: 'pantallas' | 'modales';
  /** Colores de fábrica, `#rrggbb`. */
  fondo: string;
  texto: string;
}

export const BOTONES_DEL_PANEL: readonly BotonDelPanel[] = [
  { id: 'principal', nombre: 'Principal', dondeAparece: 'Guardar, Crear, Subir… en las pantallas', grupo: 'pantallas', fondo: '#7db828', texto: '#ffffff' },
  // En modo oscuro se queda transparente con borde: el color elegido solo cambia el claro.
  { id: 'secundario', nombre: 'Secundario', dondeAparece: 'Cancelar, Descartar, Escuchar… (en modo oscuro, transparente)', grupo: 'pantallas', fondo: '#ffffff', texto: '#344054' },
  { id: 'azul-oscuro', nombre: 'Azul oscuro', dondeAparece: '«Reintentar» cuando una lista no carga', grupo: 'pantallas', fondo: '#0d1526', texto: '#ffffff' },
  // En modo oscuro se invierte (fondo del color de la letra y al revés), como hasta ahora.
  { id: 'principal-modal', nombre: 'Principal', dondeAparece: 'Confirmar o Guardar en una ventana (en modo oscuro, invertido)', grupo: 'modales', fondo: '#001631', texto: '#ffffff' },
  { id: 'secundario-modal', nombre: 'Secundario', dondeAparece: 'Cancelar en una ventana (en modo oscuro, transparente)', grupo: 'modales', fondo: '#ffffff', texto: '#001631' },
  { id: 'peligro', nombre: 'Peligro', dondeAparece: 'Eliminar y lo que no se puede deshacer', grupo: 'modales', fondo: '#dc2626', texto: '#ffffff' },
  { id: 'verde', nombre: 'Verde', dondeAparece: 'Guardar en las ventanas de Roles', grupo: 'modales', fondo: '#7db728', texto: '#ffffff' },
];
