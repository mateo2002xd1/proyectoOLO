import { BuscadorModal } from '@/features/admin-panel/buscador';

/**
 * Buscador del panel, al que ya apuntaban la lupa de la barra superior y el enlace
 * «Buscar» del menú lateral.
 *
 * Es una ruta y no un estado dentro del dashboard para que la búsqueda tenga
 * dirección propia: se puede enlazar, marcar y volver atrás con el navegador. La
 * capa que pinta `BuscadorModal` tapa el marco del panel entera, así que la ruta en
 * sí no necesita maquetación.
 */
export default function AdminBuscarPage() {
  return <BuscadorModal />;
}
