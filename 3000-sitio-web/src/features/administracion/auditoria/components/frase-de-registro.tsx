import { fechaDeFila, RESALTE_DE_FILA } from '@/shared/ui/molecules/fila-acordeon';
import { resumenDeCambios } from '../lib/cambios';
import { colorDeAccion, etiquetaDeAccion, type RegistroAuditoria } from '../types';

/**
 * Lo que cambió, para ir detrás de «hizo la acción de [Publicado]:» en la frase del
 * acordeón: «Publicó la versión 4» pasa a «publicó…». Lo que empieza por comillas (un
 * comentario) queda igual.
 */
const enMinuscula = (texto: string) => (texto ? texto.charAt(0).toLocaleLowerCase('es') + texto.slice(1) : texto);

/** La acción del registro en su píldora de color, la misma en la tabla y en la frase. */
export function PildoraDeAccion({ registro }: { registro: RegistroAuditoria }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${colorDeAccion(registro.accion, registro.categoria)}`}
    >
      {etiquetaDeAccion(registro.accion, registro.categoria)}
    </span>
  );
}

/**
 * La frase de un registro de la bitácora en acordeón (móvil y tablet), como la pidió el
 * usuario (2026-10-10). Plegada, «El usuario Ana Gómez hizo la acción de [Editado]»;
 * desplegada, con lo que cambió y la fecha: «… hizo la acción de [Publicado]: publicó la
 * versión 4 de /inicio el 9 de octubre de 2026 a las 3:00 p. m.». Sin la entidad
 * («Usuario», «Página»): junto al nombre de una persona confundía.
 *
 * La usan Auditoría y «Actividad reciente» del dashboard, para que las dos lean igual un
 * registro. En Auditoría va dentro de `ResumenDeFila`; en el dashboard, siempre entera
 * (`abierta`), una por línea de la lista.
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

/**
 * La frase del registro en voz activa, para que siga a «El usuario Ana Gómez …»: la API
 * redacta en impersonal («Se publicó la versión 4 de «inicio»», «El usuario envió su
 * edición a revisión · …») y aquí se pasa a «publicó la versión 4…», «envió su edición…».
 * Lo que no empieza por un verbo («La cuenta de … pasó a inactiva», un comentario entre
 * comillas, una lista de campos) va detrás de «registró que» o «registró:».
 */
function enVozActiva(resumen: string): string {
  if (!resumen) return 'registró una acción sin cambios';
  if (resumen.startsWith('Se depuraron ')) return `depuró ${resumen.slice('Se depuraron '.length)}`;
  if (resumen.startsWith('Se verificaron ')) return `verificó ${resumen.slice('Se verificaron '.length)}`;
  if (resumen.startsWith('Se ')) return resumen.slice(3);
  if (resumen.startsWith('El usuario ')) return resumen.slice('El usuario '.length);
  if (resumen.startsWith('El editor ')) return resumen.slice('El editor '.length);
  if (resumen.startsWith('Guardado automático')) return `guardó automáticamente${resumen.slice('Guardado automático'.length)}`;
  if (resumen.startsWith('Respuestas incorrectas')) return `dio respuestas incorrectas${resumen.slice('Respuestas incorrectas'.length)}`;
  // «Inició sesión», «Cambió su contraseña», «Recuperó el acceso», «Respondió…»: ya es
  // un verbo en pretérito, basta la minúscula.
  if (/^\p{L}+ó(?=\s|$)/u.test(resumen)) return enMinuscula(resumen);
  if (resumen.startsWith('La ') || resumen.startsWith('El ')) return `registró que ${enMinuscula(resumen)}`;
  return `registró: ${resumen}`;
}

/**
 * La frase de un registro en «Actividad reciente» del dashboard, como la pidió el usuario
 * (2026-10-15): «El usuario David Tejada inició sesión en el sitio web el 15 de octubre
 * de 2026 a las 6:12 p. m. - [Autenticado]». Lo que pasó va primero y la píldora al
 * final. Auditoría sigue con `FraseDeRegistro`.
 */
export function FraseDeActividad({
  registro,
  nombre,
}: {
  registro: RegistroAuditoria;
  /** Quién lo hizo; sin nombre, «El sistema». */
  nombre: string | null | undefined;
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
      {enVozActiva(resumenDeCambios(registro))} el{' '}
      <span className={RESALTE_DE_FILA}>{fechaDeFila(registro.fecha)}</span> -{' '}
      <PildoraDeAccion registro={registro} />
    </>
  );
}
