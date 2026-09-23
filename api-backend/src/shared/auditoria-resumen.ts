import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/content-audit-log';
import type { CampoModificado } from '../repositories/auditoria.repository';

/**
 * La frase que lee quien audita, construida aquí y no en la pantalla.
 *
 * La columna «Cambios» enseñaba el campo crudo —`status: active`,
 * `expiration_date: 2026-09-20T00:00:00.000Z`—: correcto como dato, ilegible como
 * bitácora, y sin decir **sobre quién**. Quien administra no tendría que traducir
 * códigos internos ni abrir el detalle para saber qué pasó.
 *
 * Se resuelve en el backend por tres razones:
 *
 * - La bitácora la leen la tabla, el detalle y el CSV. Una sola fuente evita que
 *   cuenten tres versiones distintas de lo mismo.
 * - El correo del usuario afectado **no está en la fila**: `entidad_id` es su id, y
 *   resolverlo es una consulta, no algo que la pantalla pueda inventar.
 * - Vale para las filas que ya existen. No se guarda nada nuevo en la tabla: la frase
 *   se calcula al leer, así que los registros de ayer también quedan explicados.
 *
 * **Nada de esto se escribe en `campos_modificados`.** Esa columna es la evidencia
 * —qué campo cambió, de qué a qué— y meterle texto de presentación, o un correo que
 * nadie modificó, la convierte en algo que ya no se sostiene como prueba.
 */

/** Acciones que alguien decidió desde el panel. */
const ACCIONES_DEL_PANEL = new Set<AccionAuditable>(['actualizar', 'inactivar']);

/**
 * Campos que esta versión sabe contar en palabras.
 *
 * Mientras un cambio toque **solo** campos de esta lista, la fila se explica con una
 * frase. En cuanto toque cualquier otro se devuelve `null` y la pantalla enseña la
 * lista de campos de siempre: es preferible un texto feo a una frase que cuente la
 * mitad y esconda el resto.
 */
const CAMPOS_CON_FRASE = new Set(['status', 'expiration_date']);

/**
 * El día de una fecha, en UTC y como `YYYY-MM-DD`.
 *
 * **En UTC a propósito.** `fecha_caducidad` es un `TIMESTAMP`, pero lo que se guarda
 * ahí es un día suelto: el panel manda `2026-09-20` y Sequelize lo convierte en la
 * medianoche UTC de ese día. Leerlo con los getters locales, en Colombia (UTC-5),
 * devuelve el 19 — un día menos que el que se eligió, justo en la pantalla que existe
 * para demostrar qué se eligió.
 */
const diaUtc = (valor: unknown): string | null => {
  if (valor === null || valor === undefined) return null;

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10);
  }

  const texto = String(valor).trim();
  if (!texto) return null;

  // Un día suelto no pasa por `Date`: no hace falta, y así no depende de nada.
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 10);
};

/** `2026-09-20` → `20/09/2026`, que es como se escribe una fecha aquí. */
const enDiaMesAno = (valor: unknown): string | null => {
  const iso = diaUtc(valor);
  if (!iso) return null;

  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

/**
 * Si el campo cambió de verdad.
 *
 * Hace falta porque el formulario de usuarios manda **siempre** `name`, `apellidos`,
 * `email` y `role_id`, cambien o no: sin esta comprobación, editar solo la fecha de
 * caducidad parecería un cambio de cinco campos y ninguna frase encajaría.
 *
 * La fecha se compara por día y no por texto: el «antes» llega de la base como
 * `2026-09-19T00:00:00.000Z` y el «después» del formulario como `2026-09-19`. Son el
 * mismo día escrito de dos formas, y como texto se darían por distintos.
 */
const cambioDeVerdad = ({ campo, antes, despues }: CampoModificado): boolean => {
  if (campo === 'expiration_date') return diaUtc(antes) !== diaUtc(despues);
  return JSON.stringify(antes ?? null) !== JSON.stringify(despues ?? null);
};

/** Fase 1: activar o inactivar una cuenta, con el correo de quien la tiene. */
const fraseDeEstado = (despues: unknown, email: string | null): string | null => {
  const sujeto = email ? `el usuario ${email}` : 'la cuenta';

  if (despues === 'active') return `Se activó ${sujeto}`;
  if (despues === 'inactive') return `Se inactivó ${sujeto}`;
  return null;
};

/** Un valor de `campos_modificados` como texto, venga como número o como cadena. */
const comoTextoONumero = (valor: unknown): string | null => {
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor);
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
};

/**
 * Los dos motivos por los que una versión de página deja de estar publicada.
 *
 * Archivar una página **no lo decide nadie**: una versión sale de la vista porque otra
 * ocupa su sitio, al aprobar una nueva o al restaurar una anterior. No hay ninguna
 * función para retirar una página del aire a propósito. El texto lo genera la API, y
 * lleva dentro el número de la versión que entró, que es el único sitio donde está.
 *
 * Los constructores viven aquí, pegados a la expresión que vuelve a leerlos, y quien
 * escribe la fila los importa de este archivo. Sueltos en cada controlador, cambiar la
 * redacción en un sitio dejaría la frase sin armarse en el otro **y en silencio**: el
 * resumen devolvería `null` y la pantalla volvería al texto de antes sin que nadie se
 * entere de por qué.
 */
export const MOTIVO_DE_ARCHIVADO = {
  alPublicar: (version: unknown) => `Archivada al publicar versión ${version}`,
  alRestaurar: (version: unknown) => `Archivada por restauración de versión ${version}`,
};

/**
 * Se exige `\d+` y no cualquier cosa a propósito: si el número llegara en blanco, el
 * motivo diría «versión undefined» y la frase saldría con esa palabra dentro. Sin
 * coincidencia se devuelve `null` y la pantalla enseña el motivo crudo, que es feo
 * pero cierto.
 */
const CAUSAS_DE_ARCHIVADO = [
  { patron: /^Archivada al publicar versión\s+(\d+)\s*$/i, comoSeDice: 'al publicar la' },
  { patron: /^Archivada por restauración de versión\s+(\d+)\s*$/i, comoSeDice: 'al restaurar la' },
];

/**
 * Fase 4: qué versión salió de la vista, y por culpa de cuál.
 *
 * La columna decía «Sin comentario · Archivada al publicar versión 9», y de ahí se
 * entendían dos cosas equivocadas: que alguien había archivado una página a mano, y que
 * la versión 9 se había publicado sin comentario. Ese «Sin comentario» es el de la
 * versión **archivada**, no el de la que entró; en la tabla, sin la explicación que sí
 * trae el detalle, se leía justo al revés.
 *
 * Solo para páginas. Un contenido —un banner, un estudio— sí se archiva a mano, y ahí
 * la lista de campos de siempre dice la verdad.
 */
const fraseDeArchivado = (campos: CampoModificado[]): string | null => {
  const motivo = comoTextoONumero(campos.find((c) => c.campo === 'motivo')?.despues);
  if (!motivo) return null;

  const causa = CAUSAS_DE_ARCHIVADO.map((c) => ({ ...c, coincidencia: motivo.match(c.patron) }))
    .find((c) => c.coincidencia);
  if (!causa?.coincidencia) return null;

  // `version` lleva el número de la archivada en las dos puntas: la fila trata de ella.
  const version = campos.find((c) => c.campo === 'version');
  const archivada = comoTextoONumero(version?.antes ?? version?.despues);
  if (!archivada) return null;

  const partes = [
    `Se archivó la versión ${archivada} ${causa.comoSeDice} ${causa.coincidencia[1]}`,
  ];

  // El comentario de la que salió va detrás y diciendo de quién es. Callarlo escondería
  // lo único que contaba qué decía la página antes; dejarlo como estaba lo hacía pasar
  // por el de la versión recién publicada.
  const comentario = comoTextoONumero(campos.find((c) => c.campo === 'comentario')?.antes);
  if (comentario) partes.push(`Comentario de la archivada: «${comentario}»`);

  return partes.join(' · ');
};

/**
 * La versión y la página de una fila del ciclo editorial, como `versión 36 de «inicio»`.
 *
 * `null` si falta algo o si el slug cambia entre el antes y el después: eso sería un
 * renombre de la página, y una frase que no lo diga lo estaría escondiendo.
 */
const versionDePagina = (campos: CampoModificado[]): string | null => {
  const campo = (nombre: string) => campos.find((c) => c.campo === nombre);

  const slugAntes = comoTextoONumero(campo('slug')?.antes);
  const slugDespues = comoTextoONumero(campo('slug')?.despues);
  if (slugAntes && slugDespues && slugAntes !== slugDespues) return null;
  const pagina = slugDespues ?? slugAntes;

  const numero = comoTextoONumero(campo('version')?.despues);
  if (!pagina || !numero) return null;

  return `versión ${numero} de «${pagina}»`;
};

/** Los únicos campos que escribe `guardarBorrador` en `pagina.controller.ts`. */
const CAMPOS_DEL_BORRADOR = new Set(['slug', 'version', 'estado']);

/**
 * Fase 5: guardar el borrador de una página.
 *
 * Una sola frase, la que definió el usuario para no confundir a quien audita: el guardado
 * es algo que decidió una persona al pulsar «Guardar». Da igual si abrió una versión
 * nueva o volvió a guardar la misma; eso sigue en el detalle, con su antes y su después.
 *
 * **Salvo los guardados automáticos de antes del cambio.** Hasta ahora el editor guardaba
 * por su cuenta un instante antes de cada envío a revisión, y esas filas siguen en la
 * base. Decir de ellas que «el usuario guardó su edición» sería falso: nadie pulsó nada.
 * Quien las reconoce es `guardadosPreviosAEnvio`, en `audit.usecase.ts`. Desde este
 * cambio ya no se escriben: el contenido viaja con el envío y la API lo guarda sin fila
 * propia (ver `PaginaController.enviarARevision`).
 */
const fraseDeBorrador = (campos: CampoModificado[], automatico: boolean): string | null => {
  if (campos.some(({ campo }) => !CAMPOS_DEL_BORRADOR.has(campo))) return null;

  const estado = campos.find((c) => c.campo === 'estado');
  if (estado && comoTextoONumero(estado.despues) !== 'borrador') return null;

  const cual = versionDePagina(campos);
  if (!cual) return null;

  return automatico
    ? `Guardado automático al enviar a revisión · ${cual}`
    : `El usuario guardó su edición en borrador · ${cual}`;
};

/** Los campos que escribe `PaginaController.enviarARevision`. */
const CAMPOS_DEL_ENVIO = new Set(['comentario', 'slug', 'version', 'estado']);

/**
 * Fase 6: enviar una página a revisión, con su «commit».
 *
 * La columna solo enseñaba el comentario, sin decir de qué página ni de qué versión: la
 * columna «Entidad» pone «Página» y nada más. Ahora dice las dos cosas y el comentario va
 * detrás, entre comillas, porque es texto de quien edita y no de la API.
 *
 * Las filas de antes de que el comentario fuera obligatorio no traen el campo, y lo dicen.
 */
const fraseDeEnvio = (campos: CampoModificado[]): string | null => {
  if (campos.some(({ campo }) => !CAMPOS_DEL_ENVIO.has(campo))) return null;

  const estado = campos.find((c) => c.campo === 'estado');
  if (estado && comoTextoONumero(estado.despues) !== 'en_revision') return null;

  const cual = versionDePagina(campos);
  if (!cual) return null;

  const comentario = comoTextoONumero(campos.find((c) => c.campo === 'comentario')?.despues);

  return `El usuario envió su edición a revisión · ${cual} · ${comentario ? `«${comentario}»` : 'Sin comentario'}`;
};

/**
 * Fase 3: desde qué portal se inició sesión.
 *
 * Los dos entran por el mismo `POST /api/login`, así que el origen no se puede deducir
 * de la fila: lo marca cada aplicación al llamar y la API lo guarda en `origen`. Las
 * filas anteriores a esto no lo llevan y se quedan con el «Inició sesión» a secas que
 * decían hasta ahora, que es verdad aunque diga menos.
 */
const FRASE_POR_APLICACION: Record<string, string> = {
  'sitio-web': 'Inició sesión en el sitio web',
  intranet: 'Inició sesión en la intranet',
};

const fraseDeAutenticacion = (campos: CampoModificado[]): string | null => {
  const origen = campos.find((c) => c.campo === 'origen')?.despues;
  return typeof origen === 'string' ? FRASE_POR_APLICACION[origen] ?? null : null;
};

/** Fase 2: la fecha de caducidad, de la que era a la que quedó. */
const fraseDeCaducidad = (antes: unknown, despues: unknown): string | null => {
  const desde = enDiaMesAno(antes);
  const hasta = enDiaMesAno(despues);

  if (desde && hasta) return `Se actualizó la fecha de caducidad de ${desde} a ${hasta}`;
  if (hasta) return `Se asignó la fecha de caducidad ${hasta}`;
  if (desde) return `Se quitó la fecha de caducidad, que era ${desde}`;
  return null;
};

export interface DatosDelResumen {
  accion: AccionAuditable;
  entidadTipo: EntidadAuditable;
  camposModificados: CampoModificado[];
  /** Correo de la cuenta sobre la que se actuó, ya resuelto. */
  emailAfectado?: string | null;
  /**
   * Si la fila es uno de los guardados que el editor hacía solo, un instante antes de
   * enviar a revisión. Lo resuelve `guardadosPreviosAEnvio`: la fila sola no lo sabe.
   */
  guardadoAutomatico?: boolean;
}

/**
 * La frase de una entrada, o `null` si esta versión no sabe contarla.
 *
 * `null` no es un fallo: es «que lo cuente quien ya lo contaba». La pantalla conserva
 * su camino de siempre, y cada fase nueva mueve un caso más a este lado.
 *
 * Basta con que **un** campo del cambio se resista para devolver `null` entero. Una
 * frase que hable de la fecha y se calle el estado es peor que la lista cruda: quien
 * audita leería como completo un resumen que no lo es.
 */
export const resumenDeRegistro = (datos: DatosDelResumen): string | null => {
  const campos = datos.camposModificados ?? [];

  if (datos.entidadTipo === 'pagina') {
    // Archivar una versión de página es consecuencia de publicar otra, no un acto propio.
    if (datos.accion === 'despublicar') return fraseDeArchivado(campos);
    if (datos.accion === 'guardar_borrador') {
      return fraseDeBorrador(campos, Boolean(datos.guardadoAutomatico));
    }
    if (datos.accion === 'enviar_revision') return fraseDeEnvio(campos);
    return null;
  }

  if (datos.entidadTipo !== 'usuario') return null;

  // Un login no describe un campo que cambió sino desde dónde se entró, así que tiene
  // su propia rama, antes de toda la comparación de «antes» contra «después».
  if (datos.accion === 'autenticar') return fraseDeAutenticacion(campos);

  // `expirar` también deja `status: inactive`, pero eso no lo decidió nadie: se
  // cumplió una fecha. Contarlo como «se inactivó el usuario» le atribuiría a una
  // persona algo que hizo el sistema.
  if (!ACCIONES_DEL_PANEL.has(datos.accion)) return null;

  const cambios = campos.filter(cambioDeVerdad);
  if (cambios.length === 0) return null;
  if (cambios.some(({ campo }) => !CAMPOS_CON_FRASE.has(campo))) return null;

  const email = datos.emailAfectado?.trim() || null;
  const frases: string[] = [];

  for (const { campo, antes, despues } of cambios) {
    const frase = campo === 'status' ? fraseDeEstado(despues, email) : fraseDeCaducidad(antes, despues);
    if (!frase) return null;
    frases.push(frase);
  }

  return frases.join(' · ');
};

/**
 * El correo que la propia fila recuerda, para cuando la cuenta ya no existe.
 *
 * El formulario de edición manda el correo en cada guardado, así que muchas filas lo
 * llevan aunque no cambiara. Es el último recurso: mientras la cuenta viva, el correo
 * bueno es el que devuelve la consulta y no el que quedó congelado en la fila.
 */
export const emailEnLaFila = (campos: CampoModificado[]): string | null => {
  const campo = campos.find((c) => c.campo === 'email');
  const valor = campo?.despues ?? campo?.antes;
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
};
