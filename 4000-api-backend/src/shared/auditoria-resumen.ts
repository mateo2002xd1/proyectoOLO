import type { AccionAuditable, EntidadAuditable } from '../infrastructure/db/models/content-audit-log';
import type { CampoModificado } from '../repositories/auditoria.repository';
import { VALOR_OMITIDO } from './auditoria-campos';
import { CATALOGO_PERMISOS, partesDeClaveDeSeccion } from './catalogo-permisos';

/**
 * La frase que lee quien audita, construida aquí y no en la pantalla.
 *
 * La columna «Cambios» enseñaba el campo crudo —`status: active`,
 * `expiration_date: 2026-09-20T00:00:00.000Z`, `via: cambio-voluntario`—: correcto como
 * dato, ilegible como bitácora, y sin decir **sobre quién**. Quien administra no tendría
 * que traducir códigos internos ni abrir el detalle para saber qué pasó.
 *
 * Se resuelve en el backend por tres razones:
 *
 * - La bitácora la leen la tabla, el detalle y el CSV. Una sola fuente evita que
 *   cuenten tres versiones distintas de lo mismo.
 * - Lo que hace falta para decirlo bien **no está en la fila**: el correo del usuario
 *   afectado o el nombre de un rol son consultas, no algo que la pantalla pueda inventar.
 * - Vale para las filas que ya existen. No se guarda nada nuevo en la tabla: la frase
 *   se calcula al leer, así que los registros de ayer también quedan explicados.
 *
 * **Nada de esto se escribe en `campos_modificados`.** Esa columna es la evidencia
 * —qué campo cambió, de qué a qué— y meterle texto de presentación la convierte en algo
 * que ya no se sostiene como prueba. El detalle de cada fila la sigue enseñando entera.
 *
 * El archivo va **por acción**, en el orden del filtro de la pantalla. Cada acción tiene
 * sus frases propias, y lo que ninguna sabe contar cae en `fraseGenerica`, que nombra
 * los campos en español y dice de qué valor a qué valor pasaron. Ninguna fila vuelve a
 * salir en crudo, y ninguna frase se calla un campo: cuando una regla propia no encaja
 * con lo que trae la fila, cede el paso a la genérica en vez de contar la mitad.
 */

// ═════════════════════════════════════════════════════════════════════════════
// Utilidades
// ═════════════════════════════════════════════════════════════════════════════

/** Un valor de `campos_modificados` como texto, venga como número o como cadena. */
const comoTextoONumero = (valor: unknown): string | null => {
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor);
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
};

/** El cambio de un campo concreto dentro de los campos modificados, si está. */
const campoDe = (campos: CampoModificado[], nombre: string) =>
  campos.find((c) => c.campo === nombre);

/** `true` si la fila no trae ningún campo fuera de `permitidos`. */
const soloTrae = (campos: CampoModificado[], permitidos: string[]) =>
  campos.every(({ campo }) => permitidos.includes(campo));

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
 * caducidad parecería un cambio de cinco campos.
 *
 * La fecha se compara por día y no por texto: el «antes» llega de la base como
 * `2026-09-19T00:00:00.000Z` y el «después» del formulario como `2026-09-19`. Son el
 * mismo día escrito de dos formas, y como texto se darían por distintos.
 */
const cambioDeVerdad = ({ campo, antes, despues }: CampoModificado): boolean => {
  if (campo === 'expiration_date') return diaUtc(antes) !== diaUtc(despues);
  return JSON.stringify(antes ?? null) !== JSON.stringify(despues ?? null);
};

const EN_EL_PORTAL: Record<string, string> = { sitio: 'el sitio web', intranet: 'la intranet' };

/** Con «de» delante: «del sitio web», no «de el sitio web». */
const DEL_PORTAL: Record<string, string> = { sitio: 'del sitio web', intranet: 'de la intranet' };

/** `['Administrador', 'Editor']` o `'Administrador, Editor'` → `Administrador, Editor`. */
const listaDeTexto = (valor: unknown): string | null =>
  Array.isArray(valor) ? valor.map(String).join(', ') || null : comoTextoONumero(valor);

// ─── Permisos ────────────────────────────────────────────────────────────────

const ETIQUETA_DE_PERMISO = new Map(CATALOGO_PERMISOS.map((p) => [p.clave, p.etiqueta]));

/**
 * Un permiso como lo ve una persona: `«Crear páginas nuevas»`, no `secciones.crear`.
 *
 * Los de sección se dicen enteros —`de editar la página «Inicio» del sitio web`—
 * porque en el catálogo su etiqueta es solo el nombre de la página, y «el permiso
 * «Inicio»» no le dice a nadie qué deja hacer. Las secciones creadas desde el editor
 * no están en el catálogo: se nombran por su ruta.
 */
const nombreDePermiso = (clave: unknown): string | null => {
  const texto = comoTextoONumero(clave);
  if (!texto) return null;

  const seccion = partesDeClaveDeSeccion(texto);
  if (seccion) {
    const nombre = ETIQUETA_DE_PERMISO.get(texto) ?? seccion.slug;
    return `de editar la página «${nombre}» ${DEL_PORTAL[seccion.ambito] ?? `de ${seccion.ambito}`}`;
  }

  const fija = ETIQUETA_DE_PERMISO.get(texto);
  return `«${fija ?? texto}»`;
};

// ─── Lo genérico: un campo cualquiera, en palabras ───────────────────────────

const ETIQUETA_DE_CAMPO: Record<string, string> = {
  name: 'nombre',
  apellidos: 'apellidos',
  email: 'correo',
  role_id: 'rol',
  status: 'estado de la cuenta',
  expiration_date: 'fecha de caducidad',
  password: 'contraseña',
  slug: 'ruta',
  direccion_enlazada: 'dirección enlazada',
  versiones_reescritas: 'versiones reescritas',
  version: 'versión',
  estado: 'estado',
  motivo: 'motivo',
  comentario: 'comentario de cambios',
  titulo: 'título',
  ambito: 'portal',
  origen: 'portal',
  permiso: 'permiso',
  description: 'descripción',
  via: 'vía',
  es_sistema: 'rol del sistema',
};

/** El nombre legible de un campo (`expiration_date` → «fecha de caducidad»). */
const etiquetaDeCampo = (campo: string) =>
  ETIQUETA_DE_CAMPO[campo] ?? campo.replace(/_/g, ' ').trim().toLowerCase();

const VALOR_EN_PALABRAS: Record<string, string> = {
  active: 'activa',
  inactive: 'inactiva',
  suspended: 'suspendida',
  borrador: 'borrador',
  en_revision: 'en revisión',
  publicado: 'publicada',
  archivado: 'archivada',
  rechazado: 'rechazada',
  sitio: 'sitio web',
  intranet: 'intranet',
  'sitio-web': 'sitio web',
};

/** Lo que la frase necesita resolver fuera de la fila. */
interface Resolutores {
  nombreDeRol: (id: unknown) => string | null;
}

/**
 * Un valor guardado dicho en palabras para el resumen: roles por su nombre, fechas legibles,
 * booleanos como sí/no y los valores ocultos como «(valor oculto)».
 */
const valorEnPalabras = (campo: string, valor: unknown, r: Resolutores): string | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  if (valor === VALOR_OMITIDO) return '(valor oculto)';
  if (campo === 'role_id') {
    const rol = r.nombreDeRol(valor);
    return rol ? `«${rol}»` : 'un rol que ya no existe';
  }
  if (campo === 'expiration_date') return enDiaMesAno(valor);
  if (typeof valor === 'boolean') return valor ? 'sí' : 'no';
  if (typeof valor === 'number') return String(valor);
  if (Array.isArray(valor)) return valor.map(String).join(', ') || null;
  if (typeof valor === 'string') return VALOR_EN_PALABRAS[valor.trim()] ?? `«${valor.trim()}»`;
  return JSON.stringify(valor);
};

/** `apellidos de «Tejada» a «Vargas»`, `rol: «Editor»`, `correo: se quitó «x»`. */
const piezaGenerica = (c: CampoModificado, r: Resolutores): string | null => {
  const etiqueta = etiquetaDeCampo(c.campo);
  const antes = valorEnPalabras(c.campo, c.antes, r);
  const despues = valorEnPalabras(c.campo, c.despues, r);

  if (antes && despues) return antes === despues ? `${etiqueta}: ${despues}` : `${etiqueta} de ${antes} a ${despues}`;
  if (despues) return `${etiqueta}: ${despues}`;
  if (antes) return `${etiqueta}: se quitó ${antes}`;
  return null;
};

const VERBO_DE_ACCION: Record<AccionAuditable, string> = {
  crear: 'Se creó',
  actualizar: 'Se modificó',
  eliminar: 'Se eliminó',
  publicar: 'Se publicó',
  despublicar: 'Se archivó',
  aprobar: 'Se aprobó',
  rechazar: 'Se rechazó',
  enviar_revision: 'Se envió a revisión',
  guardar_borrador: 'Se guardó',
  autoguardar_borrador: 'Se guardó automáticamente',
  cambiar_password: 'Se cambió la contraseña de',
  autenticar: 'Inició sesión',
  expirar: 'Expiró',
  inactivar: 'Se inactivó',
  bloquear: 'Se bloqueó',
  verificar_preguntas: 'Se verificaron las preguntas de seguridad de',
};

const ALGO_DE_ESTE_TIPO: Record<EntidadAuditable, string> = {
  pagina: 'una página',
  seccion: 'una página',
  usuario: 'una cuenta de usuario',
  rol: 'un rol',
  marca: 'la marca',
  configuracion: 'la configuración',
  archivo: 'un archivo',
};

// ═════════════════════════════════════════════════════════════════════════════
// Creación
// ═════════════════════════════════════════════════════════════════════════════

const fraseDeCreacion = (d: Contexto): string | null => {
  const { campos } = d;
  const despues = (nombre: string) => comoTextoONumero(campoDe(campos, nombre)?.despues);

  if (d.entidadTipo === 'pagina') {
    if (!soloTrae(campos, ['slug', 'titulo', 'ambito', 'permiso', 'permiso_concedido_a_rol', 'roles_concedidos'])) return null;
    const slug = despues('slug');
    if (!slug) return null;

    const titulo = despues('titulo');
    const nombre = titulo && titulo !== slug ? `«${titulo}» (/${slug})` : `«${slug}»`;
    const portal = EN_EL_PORTAL[despues('ambito') ?? ''];
    const roles = listaDeTexto(
      campoDe(campos, 'roles_concedidos')?.despues ?? campoDe(campos, 'permiso_concedido_a_rol')?.despues
    );

    return [
      `Se creó la página ${nombre}${portal ? ` en ${portal}` : ''}`,
      roles ? `pueden editarla: ${roles}` : null,
    ].filter(Boolean).join(' · ');
  }

  if (d.entidadTipo === 'usuario') {
    if (!soloTrae(campos, ['name', 'apellidos', 'email', 'role_id', 'expiration_date'])) return null;
    const email = despues('email') ?? d.email;
    if (!email) return null;

    const nombre = [despues('name'), despues('apellidos')].filter(Boolean).join(' ');
    const rol = d.nombreDeRol(campoDe(campos, 'role_id')?.despues);
    const caduca = enDiaMesAno(campoDe(campos, 'expiration_date')?.despues);

    return [
      `Se creó el usuario ${email}`,
      nombre ? `nombre «${nombre}»` : null,
      rol ? `rol «${rol}»` : null,
      caduca ? `caduca el ${caduca}` : null,
    ].filter(Boolean).join(' · ');
  }

  if (d.entidadTipo === 'rol') {
    if (!soloTrae(campos, ['name', 'description'])) return null;
    const nombre = despues('name');
    if (!nombre) return null;

    const descripcion = despues('description');
    return `Se creó el rol «${nombre}»${descripcion ? ` · «${descripcion}»` : ''}`;
  }

  return null;
};

// ═════════════════════════════════════════════════════════════════════════════
// Edición: guardar y enviar a revisión
// ═════════════════════════════════════════════════════════════════════════════

/**
 * La versión y la página de una fila del ciclo editorial, como `versión 36 de «inicio»`.
 *
 * Toma el «después» y, si no hay, el «antes»: al descartar una versión la fila guarda lo
 * que había y deja el después vacío. `null` si falta algo o si el slug cambia entre el
 * antes y el después: eso sería un renombre, y una frase que no lo diga lo escondería.
 */
const versionDePagina = (campos: CampoModificado[]): string | null => {
  const slug = campoDe(campos, 'slug');
  const slugAntes = comoTextoONumero(slug?.antes);
  const slugDespues = comoTextoONumero(slug?.despues);
  if (slugAntes && slugDespues && slugAntes !== slugDespues) return null;
  const pagina = slugDespues ?? slugAntes;

  const version = campoDe(campos, 'version');
  const numero = comoTextoONumero(version?.despues) ?? comoTextoONumero(version?.antes);
  if (!pagina || !numero) return null;

  return `versión ${numero} de «${pagina}»`;
};

/**
 * Fase 5: guardar el borrador de una página.
 *
 * Una sola frase, la que definió el usuario para no confundir a quien audita: el guardado
 * es algo que decidió una persona al pulsar «Guardar».
 *
 * **Salvo los guardados automáticos de antes de la fase 6.** El editor guardaba por su
 * cuenta un instante antes de cada envío. Los listados ya no los traen, pero el análisis
 * de la depuración sí, y ahí decir «el usuario guardó» sería falso: nadie pulsó nada.
 */
const fraseDeBorrador = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['slug', 'version', 'estado'])) return null;

  const estado = campoDe(d.campos, 'estado');
  if (estado && comoTextoONumero(estado.despues) !== 'borrador') return null;

  const cual = versionDePagina(d.campos);
  if (!cual) return null;

  return d.guardadoAutomatico
    ? `Guardado automático al enviar a revisión · ${cual}`
    : `El usuario guardó su edición en borrador · ${cual}`;
};

/**
 * El autoguardado del editor (migración 040): lo que había en pantalla quedó en el
 * borrador sin que nadie pulsara «Guardar». Misma forma de fila que `fraseDeBorrador`;
 * lo único que cambia es que no se le atribuye la decisión a la persona.
 */
const fraseDeAutoguardado = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['slug', 'version', 'estado'])) return null;

  const estado = campoDe(d.campos, 'estado');
  if (estado && comoTextoONumero(estado.despues) !== 'borrador') return null;

  const cual = versionDePagina(d.campos);
  return cual ? `El editor guardó automáticamente el borrador · ${cual}` : null;
};

/**
 * Fase 6: enviar una página a revisión, con su «commit». El comentario va detrás, entre
 * comillas, porque es texto de quien edita y no de la API. Las filas de antes de que el
 * comentario fuera obligatorio no traen el campo, y lo dicen.
 */
const fraseDeEnvio = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['comentario', 'slug', 'version', 'estado'])) return null;

  const estado = campoDe(d.campos, 'estado');
  if (estado && comoTextoONumero(estado.despues) !== 'en_revision') return null;

  const cual = versionDePagina(d.campos);
  if (!cual) return null;

  const comentario = comoTextoONumero(campoDe(d.campos, 'comentario')?.despues);
  return `El usuario envió su edición a revisión · ${cual} · ${comentario ? `«${comentario}»` : 'Sin comentario'}`;
};

/**
 * Las 165 ediciones de página anteriores a `guardar_borrador`, que se escribían como
 * `actualizar` con solo el slug y la versión. No se dice «borrador» porque la fila no
 * lo dice, ni «el usuario guardó» porque no se sabe si alguien lo pulsó.
 */
const fraseDeEdicionAntigua = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['slug', 'version'])) return null;
  const cual = versionDePagina(d.campos);
  return cual ? `Se guardó la ${cual}` : null;
};

// ═════════════════════════════════════════════════════════════════════════════
// Cambio de dirección
// ═════════════════════════════════════════════════════════════════════════════

/**
 * «Editar dirección»: el cambio de slug de una página y los enlaces que se reescribieron por
 * su culpa. Se escribe como `actualizar` (no como un verbo propio: eso pide una migración del
 * `CHECK` de la bitácora y tocar la pantalla de filtros, y esta fila ya cae bien en
 * «Contenido editorial»), y se reconoce por sus campos.
 *
 * Hay dos formas de fila, las dos dentro de la misma transacción:
 * - la de la **página renombrada** (`slug` + `permiso`): cuenta de dónde a dónde, cuántos
 *   enlaces se actualizaron en lo vigente y en la historia, y en qué páginas;
 * - la de cada **página ajena cuyo contenido se reescribió** (`direccion_enlazada`): sin ella,
 *   la historia de `menu-y-pie` no diría que su versión publicada cambió sin pasar por la
 *   aprobación.
 */
const CAMPOS_DE_CAMBIO_DE_DIRECCION = [
  'slug',
  'permiso',
  'enlaces_actualizados',
  'enlaces_en_historial',
  'paginas_con_enlaces_actualizados',
  'direccion_enlazada',
  'versiones_reescritas',
];

const enEnlaces = (n: number) => (n === 1 ? '1 enlace' : `${n} enlaces`);

const fraseDeCambioDeDireccion = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, CAMPOS_DE_CAMBIO_DE_DIRECCION)) return null;
  const vigentes = Number(comoTextoONumero(campoDe(d.campos, 'enlaces_actualizados')?.despues) ?? 0);

  // Una página ajena a la que se le reescribieron enlaces.
  const enlazada = campoDe(d.campos, 'direccion_enlazada');
  if (enlazada) {
    const antes = comoTextoONumero(enlazada.antes);
    const despues = comoTextoONumero(enlazada.despues);
    if (!antes || !despues) return null;
    const versiones = comoTextoONumero(campoDe(d.campos, 'versiones_reescritas')?.despues);
    return [
      `Se actualizaron ${enEnlaces(vigentes)} de /${antes} a /${despues} por el cambio de dirección de esa página`,
      versiones ? `Versiones tocadas: ${versiones}` : null,
      'Sin pasar por la aprobación',
    ].filter(Boolean).join(' · ');
  }

  // La página que cambió de dirección.
  const slug = campoDe(d.campos, 'slug');
  if (!slug || !campoDe(d.campos, 'permiso')) return null;
  const antes = comoTextoONumero(slug.antes);
  const despues = comoTextoONumero(slug.despues);
  if (!antes || !despues) return null;

  const historial = Number(comoTextoONumero(campoDe(d.campos, 'enlaces_en_historial')?.despues) ?? 0);
  const paginas = comoTextoONumero(campoDe(d.campos, 'paginas_con_enlaces_actualizados')?.despues);
  return [
    `Se cambió la dirección de la página de /${antes} a /${despues}`,
    vigentes > 0
      ? `${enEnlaces(vigentes)} actualizado${vigentes === 1 ? '' : 's'}${paginas ? ` en ${paginas}` : ''}`
      : 'Ningún enlace que actualizar',
    historial > 0 ? `${enEnlaces(historial)} en versiones anteriores` : null,
  ].filter(Boolean).join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Rechazo
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Qué versión se rechazó, qué decía quien la envió y por qué la rechazaron.
 *
 * El motivo es el «commit» del rechazo: lo escribe quien revisa y es lo que quien editó
 * necesita para corregir. Va con su nombre delante para que no se confunda con el
 * comentario del envío, que es el de la otra persona.
 */
const fraseDeRechazo = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['comentario', 'slug', 'version', 'estado', 'motivo'])) return null;

  const cual = versionDePagina(d.campos);
  if (!cual) return null;

  const comentario = comoTextoONumero(campoDe(d.campos, 'comentario')?.despues);
  const motivo = comoTextoONumero(campoDe(d.campos, 'motivo')?.despues);

  return [
    `Se rechazó la ${cual}`,
    comentario ? `Su comentario: «${comentario}»` : null,
    motivo ? `Motivo del rechazo: «${motivo}»` : 'Sin motivo escrito',
  ].filter(Boolean).join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Publicación
// ═════════════════════════════════════════════════════════════════════════════

/** Aprobar es publicar: la versión revisada pasa a verse, con el comentario con que llegó. */
const fraseDeAprobacion = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['comentario', 'slug', 'version', 'estado'])) return null;

  const cual = versionDePagina(d.campos);
  if (!cual) return null;

  const comentario = comoTextoONumero(campoDe(d.campos, 'comentario')?.despues);
  return `Se aprobó y publicó la ${cual} · ${comentario ? `«${comentario}»` : 'Sin comentario'}`;
};

/**
 * `publicar` sobre una página es, hoy, restaurar una versión anterior: vuelve a verse una
 * que ya se había publicado. Las filas más viejas, sin motivo, son publicaciones de antes
 * de que existiera la aprobación.
 */
const fraseDePublicacion = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['comentario', 'slug', 'version', 'motivo'])) return null;

  const cual = versionDePagina(d.campos);
  if (!cual) return null;

  const motivo = comoTextoONumero(campoDe(d.campos, 'motivo')?.despues);
  const comentario = comoTextoONumero(campoDe(d.campos, 'comentario')?.despues);
  const restaurada = Boolean(motivo && /^Restaurada versión anterior/i.test(motivo));

  return [
    restaurada ? `Se restauró y publicó la ${cual}` : `Se publicó la ${cual}`,
    comentario ? `«${comentario}»` : null,
  ].filter(Boolean).join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Archivado
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Los dos motivos por los que una versión de página deja de estar publicada.
 *
 * Archivar una página **no lo decide nadie**: una versión sale de la vista porque otra
 * ocupa su sitio, al aprobar una nueva o al restaurar una anterior. El texto lo genera la
 * API, y lleva dentro el número de la versión que entró, que es el único sitio donde está.
 *
 * Los constructores viven aquí, pegados a la expresión que vuelve a leerlos, y quien
 * escribe la fila los importa de este archivo: cambiar la redacción en un solo sitio
 * dejaría la frase sin armarse **y en silencio**.
 */
export const MOTIVO_DE_ARCHIVADO = {
  /** Motivo de una versión que se archivó porque se publicó otra. */
  alPublicar: (version: unknown) => `Archivada al publicar versión ${version}`,
  /** Motivo de una versión que se archivó porque se restauró otra. */
  alRestaurar: (version: unknown) => `Archivada por restauración de versión ${version}`,
};

/** Se exige `\d+`: con el número en blanco, la frase diría «la undefined». */
const CAUSAS_DE_ARCHIVADO = [
  { patron: /^Archivada al publicar versión\s+(\d+)\s*$/i, comoSeDice: 'al publicar la' },
  { patron: /^Archivada por restauración de versión\s+(\d+)\s*$/i, comoSeDice: 'al restaurar la' },
];

/**
 * Fase 4: qué versión salió de la vista, y por culpa de cuál. El comentario que se
 * enseña es el de la **archivada**, y se dice de quién es: suelto, se leía como el de la
 * versión recién publicada, que es justo lo contrario.
 */
const fraseDeArchivado = (d: Contexto): string | null => {
  const motivo = comoTextoONumero(campoDe(d.campos, 'motivo')?.despues);
  if (!motivo) return null;

  const causa = CAUSAS_DE_ARCHIVADO.map((c) => ({ ...c, coincidencia: motivo.match(c.patron) }))
    .find((c) => c.coincidencia);
  if (!causa?.coincidencia) return null;

  // `version` lleva el número de la archivada en las dos puntas: la fila trata de ella.
  const version = campoDe(d.campos, 'version');
  const archivada = comoTextoONumero(version?.antes ?? version?.despues);
  if (!archivada) return null;

  const comentario = comoTextoONumero(campoDe(d.campos, 'comentario')?.antes);
  return [
    `Se archivó la versión ${archivada} ${causa.comoSeDice} ${causa.coincidencia[1]}`,
    comentario ? `Comentario de la archivada: «${comentario}»` : null,
  ].filter(Boolean).join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Autenticación
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fase 3: desde qué portal se inició sesión. Las filas anteriores a que los portales se
 * identificaran no lo llevan y se quedan con «Inició sesión» a secas, que es verdad
 * aunque diga menos.
 */
const FRASE_POR_APLICACION: Record<string, string> = {
  'sitio-web': 'Inició sesión en el sitio web',
  intranet: 'Inició sesión en la intranet',
};

/** La frase de un inicio de sesión, diciendo por qué aplicación entró si se sabe. */
const fraseDeAutenticacion = (d: Contexto): string => {
  const origen = comoTextoONumero(campoDe(d.campos, 'origen')?.despues);
  return (origen && FRASE_POR_APLICACION[origen]) ?? 'Inició sesión';
};

// ═════════════════════════════════════════════════════════════════════════════
// Modificación de usuarios (incluye la inactivación desde el panel)
// ═════════════════════════════════════════════════════════════════════════════

/** Fase 1: activar o inactivar una cuenta, con el correo de quien la tiene. */
const fraseDeEstado = (despues: unknown, email: string | null): string | null => {
  const sujeto = email ? `el usuario ${email}` : 'la cuenta';
  if (despues === 'active') return `Se activó ${sujeto}`;
  if (despues === 'inactive') return `Se inactivó ${sujeto}`;
  return null;
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

/** Cada campo de una cuenta, contado como lo diría una persona. */
const piezaDeUsuario = (c: CampoModificado, r: Resolutores): string | null => {
  if (c.campo === 'reset_password') return c.despues === true ? 'se restableció la contraseña (se generó una temporal)' : null;
  if (c.campo === 'reset_security_questions') return c.despues === true ? 'se restablecieron las preguntas de seguridad' : null;
  if (c.campo === 'status') {
    if (c.despues === 'active') return 'se activó la cuenta';
    if (c.despues === 'inactive') return 'se inactivó la cuenta';
  }
  if (c.campo === 'password') return 'se cambió la contraseña';
  return piezaGenerica(c, r);
};

/**
 * Qué se le cambió a una cuenta, solo lo que cambió de verdad.
 *
 * Antes la columna decía `name: David · apellidos: Vargas · email: dtejada@sena.edu.co`,
 * que son los tres campos que el formulario manda **siempre**, cambien o no: no se sabía
 * cuál era el cambio. Ahora se comparan con lo que había y solo se nombra lo distinto:
 * «Se modificó el usuario dtejada@sena.edu.co · apellidos de «Tejada» a «Vargas»».
 *
 * Las dos frases que definió el usuario en las fases 1 y 2 se conservan tal cual cuando
 * son lo único que cambió. Y si no cambió nada —guardar el formulario sin tocarlo—, se dice.
 */
const fraseDeModificacionDeUsuario = (d: Contexto): string | null => {
  const reales = d.campos.filter(cambioDeVerdad);
  const sujeto = d.email ? `el usuario ${d.email}` : 'una cuenta de usuario';

  if (reales.length === 0) return `Se guardó ${sujeto} sin cambios`;

  // Las filas anteriores a que se capturara el estado previo traen todos los «antes»
  // vacíos: parecería que se cambió cada campo, y no se sabe. Se dice lo que quedó
  // guardado y que lo que había no consta.
  const sinAnteriores = d.campos.length > 1 && d.campos.every((c) => c.antes === null || c.antes === undefined);
  if (sinAnteriores) {
    const piezas = d.campos.map((c) => piezaDeUsuario(c, d)).filter((p): p is string => Boolean(p));
    return [`Se guardó ${sujeto} con estos datos (el registro no guardó los anteriores)`, ...piezas].join(' · ');
  }

  if (reales.length === 1) {
    const [unico] = reales;
    if (unico.campo === 'status') {
      const frase = fraseDeEstado(unico.despues, d.email);
      if (frase) return frase;
    }
    if (unico.campo === 'expiration_date') {
      const frase = fraseDeCaducidad(unico.antes, unico.despues);
      if (frase) return frase;
    }
  }

  const piezas = reales.map((c) => piezaDeUsuario(c, d)).filter((p): p is string => Boolean(p));
  return [`Se modificó ${sujeto}`, ...piezas].join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Modificación de roles
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Qué permiso se le dio o se le quitó a un rol, con su nombre y el del permiso.
 * `role-permissions.controller.ts` escribe una fila por permiso.
 */
const fraseDeModificacionDeRol = (d: Contexto): string | null => {
  const rol = d.nombreDeRolAfectado ? `«${d.nombreDeRolAfectado}»` : 'un rol';

  const asignado = campoDe(d.campos, 'permiso_asignado');
  if (asignado && d.campos.length === 1) {
    const permiso = nombreDePermiso(asignado.despues);
    return permiso ? `Se concedió al rol ${rol} el permiso ${permiso}` : null;
  }

  const revocado = campoDe(d.campos, 'permiso_revocado');
  if (revocado && d.campos.length === 1) {
    const permiso = nombreDePermiso(revocado.antes);
    return permiso ? `Se retiró al rol ${rol} el permiso ${permiso}` : null;
  }

  // Cambios del propio rol (nombre, descripción): solo lo que cambió de verdad.
  const reales = d.campos.filter(cambioDeVerdad);
  if (reales.length === 0) return `Se guardó el rol ${rol} sin cambios`;
  const piezas = reales.map((c) => piezaGenerica(c, d)).filter((p): p is string => Boolean(p));
  return [`Se modificó el rol ${rol}`, ...piezas].join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Expiró
// ═════════════════════════════════════════════════════════════════════════════

/** Nadie lo decidió: se cumplió una fecha. Por eso la frase no tiene sujeto que actúe. */
const fraseDeExpiracion = (d: Contexto): string =>
  d.email
    ? `La cuenta de ${d.email} pasó a inactiva al cumplirse su fecha de caducidad`
    : 'La cuenta pasó a inactiva al cumplirse su fecha de caducidad';

// ═════════════════════════════════════════════════════════════════════════════
// Cambio de contraseña
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Las tres vías por las que alguien cambia su propia contraseña (`logCambioDePassword`).
 * Antes la columna decía `via: cambio-voluntario`. El restablecimiento que hace un
 * administrador no es esto: queda como «Modificación» del usuario.
 */
const FRASE_POR_VIA: Record<string, string> = {
  'primer-inicio': 'Cambió la contraseña temporal en su primer ingreso',
  recuperacion: 'Recuperó el acceso con sus preguntas de seguridad y puso una contraseña nueva',
};

/** La frase de un cambio de contraseña según su vía (voluntario, primer ingreso, recuperación). */
const fraseDeCambioDePassword = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['via'])) return null;
  const via = comoTextoONumero(campoDe(d.campos, 'via')?.despues);

  // El cambio voluntario es el caso normal y se dice sin adornos, como lo definió el
  // usuario: «Cambió su contraseña de la cuenta …». Las otras dos vías sí llevan su
  // explicación, porque cuentan algo distinto de un cambio corriente.
  const especial = via ? FRASE_POR_VIA[via] : undefined;
  if (!especial) return d.email ? `Cambió su contraseña de la cuenta ${d.email}` : 'Cambió su contraseña';

  return d.email ? `${especial} · cuenta ${d.email}` : especial;
};

// ═════════════════════════════════════════════════════════════════════════════
// Bloqueo
// ═════════════════════════════════════════════════════════════════════════════

const CAUSA_DEL_BLOQUEO: Record<string, string> = {
  inicio_sesion: 'intentos fallidos de inicio de sesión',
  preguntas_seguridad: 'respuestas incorrectas a las preguntas de seguridad',
};

/**
 * La cuenta dejó de poder entrar un tiempo, y por qué. Nadie lo decidió: lo hizo el
 * sistema al llegar al tope de intentos. La IP del intento que lo disparó está en el
 * detalle de la fila.
 */
const fraseDeBloqueo = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['motivo', 'intentos_fallidos', 'minutos_bloqueo', 'bloqueado_hasta'])) return null;

  const causa = CAUSA_DEL_BLOQUEO[comoTextoONumero(campoDe(d.campos, 'motivo')?.despues) ?? ''];
  const intentos = comoTextoONumero(campoDe(d.campos, 'intentos_fallidos')?.despues);
  const minutos = comoTextoONumero(campoDe(d.campos, 'minutos_bloqueo')?.despues);
  if (!causa || !intentos || !minutos) return null;

  const cuenta = d.email ? `la cuenta de ${d.email}` : 'la cuenta';
  return `Se bloqueó ${cuenta} por ${minutos} minutos tras ${intentos} ${causa}`;
};

// ═════════════════════════════════════════════════════════════════════════════
// Verificación de preguntas de seguridad
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Si acertó o falló, y en qué intento. Los fallos son lo que interesa: cada uno acerca
 * el bloqueo, y una racha de ellos sobre una cuenta ajena es un intento de robarla.
 *
 * Las respuestas no llegan nunca aquí, ni se guardan: solo el resultado.
 */
const fraseDeVerificacionDePreguntas = (d: Contexto): string | null => {
  if (!soloTrae(d.campos, ['resultado', 'intento', 'intentos_maximos'])) return null;

  const resultado = comoTextoONumero(campoDe(d.campos, 'resultado')?.despues);
  const deLaCuenta = d.email ? ` de la cuenta ${d.email}` : '';

  if (resultado === 'correctas') return `Respondió correctamente las preguntas de seguridad${deLaCuenta}`;
  if (resultado !== 'incorrectas') return null;

  const intento = Number(campoDe(d.campos, 'intento')?.despues);
  const maximo = Number(campoDe(d.campos, 'intentos_maximos')?.despues);
  const cuantos =
    Number.isFinite(intento) && Number.isFinite(maximo) && intento > 0 && maximo > 0
      // Tras un bloqueo el contador no vuelve a cero, y el siguiente fallo bloquea otra
      // vez al instante: «intento 4 de 3» no se entendería.
      ? intento <= maximo ? `intento ${intento} de ${maximo}` : `intento ${intento}, ya por encima del máximo de ${maximo}`
      : null;

  return [`Respuestas incorrectas a las preguntas de seguridad${deLaCuenta}`, cuantos].filter(Boolean).join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Eliminación
// ═════════════════════════════════════════════════════════════════════════════

const fraseDeEliminacion = (d: Contexto): string | null => {
  const { campos } = d;
  const antes = (nombre: string) => comoTextoONumero(campoDe(campos, nombre)?.antes);

  if (d.entidadTipo === 'usuario') {
    if (!soloTrae(campos, ['email', 'name', 'apellidos'])) return null;
    // Una cuenta borrada ya no se puede consultar: solo se sabe cuál fue si la fila lo
    // guardó. Las eliminaciones anteriores a que se guardara no lo llevan, y lo dicen.
    const email = antes('email') ?? d.email;
    if (!email) return 'Se eliminó una cuenta de usuario (el registro no guardó cuál)';
    const nombre = [antes('name'), antes('apellidos')].filter(Boolean).join(' ');
    return `Se eliminó el usuario ${email}${nombre ? ` · nombre «${nombre}»` : ''}`;
  }

  if (d.entidadTipo === 'rol') {
    if (!soloTrae(campos, ['name'])) return null;
    const nombre = antes('name') ?? d.nombreDeRolAfectado;
    return nombre ? `Se eliminó el rol «${nombre}»` : 'Se eliminó un rol (el registro no guardó cuál)';
  }

  if (d.entidadTipo === 'configuracion') {
    if (!soloTrae(campos, ['depuracion_auditoria_peso', 'registros_eliminados'])) return null;
    const registros = antes('registros_eliminados');
    const peso = campoDe(campos, 'depuracion_auditoria_peso');
    return [
      'Se depuró la bitácora de auditoría',
      registros ? `se eliminaron ${registros} registros` : null,
      peso?.antes && peso?.despues ? `la tabla pasó de ${peso.antes} a ${peso.despues}` : null,
    ].filter(Boolean).join(' · ');
  }

  if (d.entidadTipo !== 'pagina') return null;

  // Depurar versiones antiguas: la única huella es el peso de la tabla.
  if (soloTrae(campos, ['peso_tabla'])) {
    const peso = campoDe(campos, 'peso_tabla');
    if (!peso?.antes || !peso?.despues) return null;
    return `Se depuraron versiones antiguas de las páginas · la tabla de versiones pasó de ${peso.antes} a ${peso.despues}`;
  }

  // Borrar una página entera.
  if (campoDe(campos, 'versiones_eliminadas') || campoDe(campos, 'permiso_retirado_a_roles')) {
    if (!soloTrae(campos, ['slug', 'titulo', 'ambito', 'permiso', 'permiso_retirado_a_roles', 'versiones_eliminadas'])) return null;
    const slug = antes('slug');
    if (!slug) return null;

    const titulo = antes('titulo');
    const nombre = titulo && titulo !== slug ? `«${titulo}» (/${slug})` : `«${slug}»`;
    const portal = DEL_PORTAL[antes('ambito') ?? ''];
    const n = Number(antes('versiones_eliminadas'));
    const versiones = Number.isFinite(n) && n > 0 ? (n === 1 ? 'y su única versión' : `y sus ${n} versiones`) : '';
    const roles = listaDeTexto(campoDe(campos, 'permiso_retirado_a_roles')?.antes);

    return [
      `Se eliminó la página ${nombre}${portal ? ` ${portal}` : ''}${versiones ? ` ${versiones}` : ''}`,
      roles ? `se retiró el permiso de edición a: ${roles}` : null,
    ].filter(Boolean).join(' · ');
  }

  // Descartar una versión que no se había publicado.
  if (campoDe(campos, 'paginaEliminada')) {
    if (!soloTrae(campos, ['comentario', 'slug', 'version', 'motivo', 'paginaEliminada'])) return null;
    const cual = versionDePagina(campos);
    if (!cual) return null;

    const comentario = comoTextoONumero(campoDe(campos, 'comentario')?.despues);
    const motivo = comoTextoONumero(campoDe(campos, 'motivo')?.despues);
    const tambienLaPagina = campoDe(campos, 'paginaEliminada')?.despues === true;

    return [
      `Se descartó la ${cual}`,
      comentario ? `Su comentario: «${comentario}»` : null,
      motivo ? `Motivo: «${motivo}»` : null,
      tambienLaPagina ? 'la página también se eliminó, porque era su única versión' : null,
    ].filter(Boolean).join(' · ');
  }

  return null;
};

// ═════════════════════════════════════════════════════════════════════════════
// Lo que ninguna regla sabe contar
// ═════════════════════════════════════════════════════════════════════════════

/**
 * La red de seguridad: qué se hizo sobre qué, y cada campo en español con su antes y su
 * después. Aparece con los contenidos —banners, estudios—, que hoy no tienen filas, y con
 * cualquier forma de fila que una regla propia no reconozca. Solo nombra lo que cambió de
 * verdad; si no cambió nada, nombra lo que hay, para no dejar la frase vacía.
 */
const fraseGenerica = (d: Contexto): string => {
  const sujeto =
    d.entidadTipo === 'usuario' && d.email ? `el usuario ${d.email}`
      : d.entidadTipo === 'rol' && d.nombreDeRolAfectado ? `el rol «${d.nombreDeRolAfectado}»`
        : ALGO_DE_ESTE_TIPO[d.entidadTipo] ?? 'un registro';

  const reales = d.campos.filter(cambioDeVerdad);
  const piezas = (reales.length > 0 ? reales : d.campos)
    .map((c) => piezaGenerica(c, d))
    .filter((p): p is string => Boolean(p));

  return [`${VERBO_DE_ACCION[d.accion] ?? 'Se registró'} ${sujeto}`, ...piezas].join(' · ');
};

// ═════════════════════════════════════════════════════════════════════════════
// Entrada
// ═════════════════════════════════════════════════════════════════════════════

export interface DatosDelResumen {
  accion: AccionAuditable;
  entidadTipo: EntidadAuditable;
  camposModificados: CampoModificado[];
  /** Id de lo afectado: hace falta para nombrar un rol. */
  entidadId?: string;
  /** Correo de la cuenta sobre la que se actuó, ya resuelto. */
  emailAfectado?: string | null;
  /**
   * Si la fila es uno de los guardados que el editor hacía solo, un instante antes de
   * enviar a revisión. Lo resuelve `guardadosPreviosAEnvio`: la fila sola no lo sabe.
   */
  guardadoAutomatico?: boolean;
  /** Nombre de un rol por su id. Sin él, los roles se nombran como «un rol». */
  nombreDeRol?: (id: unknown) => string | null;
}

/** Lo que reciben las reglas: los datos ya ordenados y los resolutores a mano. */
interface Contexto extends Resolutores {
  accion: AccionAuditable;
  entidadTipo: EntidadAuditable;
  campos: CampoModificado[];
  email: string | null;
  guardadoAutomatico: boolean;
  nombreDeRolAfectado: string | null;
}

/** Cada acción con sus reglas propias, en el orden del filtro de la pantalla. */
const reglaPropia = (d: Contexto): string | null => {
  switch (d.accion) {
    case 'crear':
      return fraseDeCreacion(d);

    case 'guardar_borrador':
      return d.entidadTipo === 'pagina' ? fraseDeBorrador(d) : null;
    case 'autoguardar_borrador':
      return d.entidadTipo === 'pagina' ? fraseDeAutoguardado(d) : null;
    case 'enviar_revision':
      return d.entidadTipo === 'pagina' ? fraseDeEnvio(d) : null;

    case 'rechazar':
      return d.entidadTipo === 'pagina' ? fraseDeRechazo(d) : null;

    case 'aprobar':
      return d.entidadTipo === 'pagina' ? fraseDeAprobacion(d) : null;
    case 'publicar':
      return d.entidadTipo === 'pagina' ? fraseDePublicacion(d) : null;

    // Un contenido —banner, estudio— sí se archiva a mano: ahí manda la genérica.
    case 'despublicar':
      return d.entidadTipo === 'pagina' ? fraseDeArchivado(d) : null;

    case 'autenticar':
      return fraseDeAutenticacion(d);

    case 'actualizar':
      if (d.entidadTipo === 'usuario') return fraseDeModificacionDeUsuario(d);
      if (d.entidadTipo === 'rol') return fraseDeModificacionDeRol(d);
      if (d.entidadTipo === 'pagina') return fraseDeCambioDeDireccion(d) ?? fraseDeEdicionAntigua(d);
      return null;
    case 'inactivar':
      return d.entidadTipo === 'usuario' ? fraseDeModificacionDeUsuario(d) : null;

    // `expirar` también deja `status: inactive`, pero no lo decidió nadie: tiene la suya.
    case 'expirar':
      return fraseDeExpiracion(d);

    case 'cambiar_password':
      return fraseDeCambioDePassword(d);

    case 'bloquear':
      return fraseDeBloqueo(d);

    case 'verificar_preguntas':
      return fraseDeVerificacionDePreguntas(d);

    case 'eliminar':
      return fraseDeEliminacion(d);

    default:
      return null;
  }
};

/**
 * La frase de una entrada. Siempre hay una: la regla propia de la acción si encaja con
 * lo que trae la fila, y si no, la genérica, que no se calla ningún campo.
 */
export const resumenDeRegistro = (datos: DatosDelResumen): string => {
  const nombreDeRol = datos.nombreDeRol ?? (() => null);

  const contexto: Contexto = {
    accion: datos.accion,
    entidadTipo: datos.entidadTipo,
    campos: datos.camposModificados ?? [],
    email: datos.emailAfectado?.trim() || null,
    guardadoAutomatico: Boolean(datos.guardadoAutomatico),
    nombreDeRol,
    nombreDeRolAfectado: datos.entidadTipo === 'rol' && datos.entidadId ? nombreDeRol(datos.entidadId) : null,
  };

  return reglaPropia(contexto) ?? fraseGenerica(contexto);
};

/**
 * El correo que la propia fila recuerda, para cuando la cuenta ya no existe.
 *
 * El formulario de edición manda el correo en cada guardado, y al eliminar una cuenta la
 * API lo guarda como «antes». Es el último recurso: mientras la cuenta viva, el correo
 * bueno es el que devuelve la consulta y no el que quedó congelado en la fila.
 */
export const emailEnLaFila = (campos: CampoModificado[]): string | null => {
  const campo = campos.find((c) => c.campo === 'email');
  const valor = campo?.despues ?? campo?.antes;
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
};
