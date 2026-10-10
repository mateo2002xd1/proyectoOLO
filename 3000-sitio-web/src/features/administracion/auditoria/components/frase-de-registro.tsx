import { fechaDeFila, RESALTE_DE_FILA } from '@/shared/ui/molecules/fila-acordeon';
import { resumenDeCambios } from '../lib/cambios';
import { COLOR_ACCION, etiquetaDeAccion, type RegistroAuditoria } from '../types';

/**
 * Lo que cambió, para ir detrás de «hizo la acción de [Publicación]:» en la frase del
 * acordeón: «Publicó la versión 4» pasa a «publicó…». Lo que empieza por comillas (un
 * comentario) queda igual.
 */
const enMinuscula = (texto: string) => (texto ? texto.charAt(0).toLocaleLowerCase('es') + texto.slice(1) : texto);

/** La acción del registro en su píldora de color, la misma en la tabla y en la frase. */
export function PildoraDeAccion({ registro }: { registro: RegistroAuditoria }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${COLOR_ACCION[registro.accion] ?? ''}`}
    >
      {etiquetaDeAccion(registro.accion, registro.categoria)}
    </span>
  );
}

/**
 * La frase de un registro de la bitácora en acordeón (móvil y tablet), como la pidió el
 * usuario (2026-10-10). Plegada, «El usuario Ana Gómez hizo la acción de [Edición]»;
 * desplegada, con lo que cambió y la fecha: «… hizo la acción de [Publicación]: publicó la
 * versión 4 de /inicio el 9 de octubre de 2026 a las 3:00 p. m.». Sin la entidad
 * («Usuario», «Página»): junto al nombre de una persona confundía.
 *
 * La usan Auditoría y «Actividad reciente» del dashboard, para que las dos lean igual un
 * registro. Va dentro de `ResumenDeFila`.
 */
export function FraseDeRegistro({
  registro,
  nombre,
  abierta,
}: {
  registro: RegistroAuditoria;
  /** Quién lo hizo; sin nombre, «El sistema». */
  nombre: string | null | undefined;
  abierta: boolean;
}) {
  return (
    <>
      {nombre ? (
        <>
          El usuario <span className={RESALTE_DE_FILA}>{nombre}</span>
        </>
      ) : (
        <span className={RESALTE_DE_FILA}>El sistema</span>
      )}{' '}
      hizo la acción de <PildoraDeAccion registro={registro} />
      {abierta && (
        <>
          : {enMinuscula(resumenDeCambios(registro)) || 'sin cambios registrados'} el{' '}
          <span className={RESALTE_DE_FILA}>{fechaDeFila(registro.fecha)}</span>
        </>
      )}
    </>
  );
}
