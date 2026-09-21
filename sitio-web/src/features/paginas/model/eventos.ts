/**
 * Aviso, dentro de la misma pestaña, de que la cola de revisión cambió.
 *
 * Lo disparan quien envía a revisión (`edicion/`) y quien aprueba, rechaza o descarta
 * (`revision/`); lo escucha el contador del panel
 * (`administracion/auth/components/panel-general.tsx`, por el nombre del evento). Vive
 * en `model/` porque lo usan dos etapas.
 */
export function notificarRevisionActualizada(detail?: { slug?: string; id?: string }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('olo:revision-actualizada', { detail }));
  }
}
