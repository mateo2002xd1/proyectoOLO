/**
 * Cambiar la dirección (el slug) de una página.
 *
 * La dirección no es solo una URL: es la identidad con la que el resto del sistema nombra la
 * página. La usan la clave de permiso `editar.{ambito}.{slug}`, el candado de edición, la
 * caché de la API y del sitio, y —sobre todo— **cada enlace guardado en el contenido de las
 * demás páginas**: el menú, el pie, los botones, los textos enriquecidos. Cambiarla sin
 * tocar eso deja el portal con enlaces rotos, así que la operación son tres cosas juntas:
 *
 *  1. **Validar** que la dirección nueva sirve y está libre.
 *  2. **Averiguar quién la enlaza** (`versionesQueEnlazan`, la misma búsqueda que usa eliminar)
 *     y, si hay enlaces vigentes, exigir que quien cambia decida actualizarlos
 *     (`actualizarEnlaces`).
 *  3. **Reescribirlos** y renombrar, todo en una transacción: o cambia todo o no cambia nada.
 *
 * ## Quién puede
 *
 * Solo quien aprueba (`paginasPolicies.puedePublicar`), además del permiso
 * `secciones.cambiar-direccion` de la ruta. Reescribir la versión **publicada** sin pasar por
 * la cola de aprobación es, en la práctica, publicar: lo que ve el ciudadano cambia en el acto.
 * Dejarlo a cualquier rol con el permiso concedido desde el panel rompería la invariante del
 * ciclo editorial («lo que ve el ciudadano solo cambia al aprobar», `8-ciclo-editorial.md`
 * §1.2). La comprobación vive aquí y no solo en la ruta (`3-seguridad-del-proyecto.md` §4.3).
 *
 * ## Qué versiones se reescriben
 *
 * Todas las que enlazan, vigentes o no. Las **vigentes** (publicada, en revisión, borradores)
 * porque, si no, al aprobarlas volvería a publicarse el enlace viejo. Las **rechazadas** porque
 * el editor las vuelve a abrir (`obtener-version-editable`) y se reenvían. Las **archivadas**
 * porque restaurar una versión anterior la vuelve a publicar tal cual. Solo las vigentes
 * cuentan para pedir consentimiento y para el aviso del diálogo: la historia no es algo que
 * quien cambia la dirección tenga que revisar, y dejarla con el enlace muerto solo crea
 * problemas.
 *
 * ## Qué impide el cambio
 *
 * - Un ámbito sin diálogo todavía (`AMBITOS_HABILITADOS`): hoy solo el sitio.
 * - La portada (`inicio`), `menu-y-pie` y las páginas de fábrica o acopladas al código:
 *   hay código que da por hecho su slug (metadatos, redirecciones, enlaces fijos).
 * - Una página que alguien tiene abierta en el editor, o que enlaza a esta y alguien tiene
 *   abierta. Reescribir su contenido por debajo haría que quien edita lo pisara al guardar.
 * - Una dirección nueva cuya clave de permiso ya tiene accesos concedidos: renombrar uniría
 *   en silencio los accesos de dos grupos de roles.
 *
 * ## Concurrencia
 *
 * Dos cosas pueden pisar la reescritura y devolver el enlace viejo sin ningún error: otro
 * cambio de dirección que lea y escriba el mismo `menu-y-pie`, y un guardado del editor (que
 * manda el contenido completo). Contra lo primero, un candado de aviso (`pg_advisory_xact_lock`)
 * por ámbito serializa los cambios entre sí; contra lo segundo, todo se lee **dentro** de la
 * transacción y las versiones afectadas se bloquean (`FOR UPDATE`) antes de reescribirlas, y
 * los candados de edición se vuelven a mirar con el bloqueo ya tomado. El candado de aviso se
 * suelta solo al cerrar la transacción: no deja nada huérfano.
 *
 * ## Lo que NO se arregla
 *
 * Los enlaces que viven fuera del portal (correos, otros sitios, marcadores) dejan de
 * funcionar: no hay redirección de la dirección vieja. El diálogo lo avisa.
 */
import { Transaction, UniqueConstraintError } from 'sequelize';
import {
  slugificar,
  motivoSlugInvalido,
  mensajeDeSlugInvalido,
} from '@olo/slug-policy';
import sequelize from '../../config/database';
import { Pagina, PaginaVersion, Permission } from '../../infrastructure/db/models';
import { claveDeSeccion, esSeccionDeFabrica } from '../../shared/catalogo-permisos';
import { reemplazarEnlaces } from '../../shared/enlaces-en-contenido';
import { resolverHref, rutaLlevaAPagina } from '../../shared/extraer-textos-puck';
import { invalidarPermisosDeRol } from '../../middlewares/require-permission.middleware';
import { BloqueoEdicionRepository } from '../../repositories/bloqueo-edicion.repository';
import { paginasPolicies } from '../../policies/paginas.policies';
import type { Ambito } from '../../shared/ambito';
import {
  versionesQueEnlazan,
  type EstadoDeVersion,
  type EstadoVigente,
  type ReferenciaAEnlace,
} from './referencias-a-pagina';

/** Un `Error` con el `status` HTTP que traduce `error.middleware.ts`. */
const fallo = (mensaje: string, status: number) =>
  Object.assign(new Error(mensaje), { status });

/**
 * Los ámbitos en los que el cambio de dirección está disponible. La intranet tiene sus
 * propias convenciones de rutas (`encuestas-*`) y todavía no tiene botón ni diálogo: se
 * añade aquí cuando los tenga.
 */
export const AMBITOS_HABILITADOS: ReadonlySet<Ambito> = new Set<Ambito>(['sitio', 'intranet']);

/** Las páginas cuyo slug el código da por hecho en todos los ámbitos. */
export const DIRECCIONES_DEL_SISTEMA: ReadonlySet<string> = new Set(['inicio', 'menu-y-pie']);

/**
 * Páginas que no son páginas de fábrica pero cuyo slug está escrito en el código: sus
 * metadatos (`METADATA_POR_SLUG` del sitio) y los valores por defecto de los bloques.
 * Renombrarlas las dejaría sin título ni descripción propios.
 */
const ACOPLADAS_AL_CODIGO: Record<Ambito, readonly string[]> = {
  sitio: ['clasificacion-cno', 'clasificacion-cuoc'],
  intranet: [],
};

/**
 * Si el slug está escrito en el código y por eso no se puede renombrar: la portada y
 * `menu-y-pie`, las páginas de fábrica de su ámbito y las acopladas.
 */
export const esDireccionProtegida = (ambito: Ambito, slug: string): boolean =>
  DIRECCIONES_DEL_SISTEMA.has(slug) ||
  esSeccionDeFabrica(ambito, slug) ||
  ACOPLADAS_AL_CODIGO[ambito].includes(slug);

/**
 * Si un slug **no** puede ser la dirección nueva: lo que el código sirve por su cuenta.
 * Más corto que `esDireccionProtegida`: una página llamada `clasificacion-cno` que se
 * borró puede volver a crearse con ese nombre; una página de fábrica, no.
 */
const esDestinoReservado = (ambito: Ambito, slug: string): boolean =>
  DIRECCIONES_DEL_SISTEMA.has(slug) || esSeccionDeFabrica(ambito, slug);

/** Lo que cuenta para el aviso y el consentimiento: lo que todavía puede llegar a verse. */
const ESTADOS_VIGENTES: EstadoVigente[] = ['publicado', 'en_revision', 'borrador'];

/** Lo que se reescribe: lo vigente y la historia que todavía se puede reabrir o restaurar. */
const ESTADOS_A_REESCRIBIR: EstadoDeVersion[] = [...ESTADOS_VIGENTES, 'rechazado', 'archivado'];

const esVigente = (estado: EstadoDeVersion) => (ESTADOS_VIGENTES as string[]).includes(estado);

/** Alguien con una página abierta en el editor. */
export interface PaginaEnEdicion {
  slug: string;
  titulo: string;
  /** Quién la tiene abierta; «tú, en otra pestaña» si es quien pregunta. */
  usuario: string;
}

/** Lo que hace falta saber de una página antes de pedirle otra dirección. */
export interface UsoDeLaDireccion {
  id: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  /** `true` si es una de las que no se pueden cambiar (`esDireccionProtegida`). */
  protegida: boolean;
  /** Dónde hay enlaces a la dirección actual, en las versiones vigentes. */
  referencias: ReferenciaAEnlace[];
  /** En cuántas páginas distintas están. */
  paginasConEnlaces: number;
  /** Quién tiene abierta esta página o alguna de las que la enlazan. */
  enEdicion: PaginaEnEdicion[];
}

export type MotivoDeDireccion = 'vacia' | 'igual' | 'invalida' | 'ocupada';

/** Si una dirección escrita sirve como nueva. */
export interface ValidacionDeDireccion {
  /** La dirección ya normalizada (`Bolsa de empleo` → `bolsa-de-empleo`). */
  valor: string;
  valida: boolean;
  motivo: MotivoDeDireccion | null;
  mensaje: string | null;
}

/** Quién pide el cambio: lo que hace falta para decidir si puede y para nombrarlo en los avisos. */
export interface ActorDelCambio {
  /** Su rol, para la comprobación de que puede aprobar. */
  rol?: string | null;
  /** Su id, para distinguir su propio candado del de otra persona. */
  usuarioId?: string | null;
}

const exigirAmbitoHabilitado = (ambito: Ambito) => {
  if (!AMBITOS_HABILITADOS.has(ambito)) {
    throw fallo(`Cambiar la dirección de una página todavía no está disponible en «${ambito}».`, 400);
  }
};

/** Quién tiene abierta cada una de estas páginas, con el candado vigente (una sola consulta). */
async function paginasEnEdicion(
  ambito: Ambito,
  paginas: { slug: string; titulo: string }[],
  usuarioId?: string | null
): Promise<PaginaEnEdicion[]> {
  const candados = await BloqueoEdicionRepository.vigentesEn(
    ambito,
    paginas.map((pagina) => pagina.slug)
  );
  const tituloDe = new Map(paginas.map((pagina) => [pagina.slug, pagina.titulo]));
  return candados.map((candado) => ({
    slug: candado.slug,
    titulo: tituloDe.get(candado.slug) ?? candado.slug,
    usuario:
      usuarioId && String(candado.usuario_id) === String(usuarioId)
        ? 'tú, en otra pestaña'
        : candado.usuario_nombre,
  }));
}

/** Las páginas distintas de una lista de referencias, más la propia, sin repetir. */
function paginasInvolucradas(
  propia: { slug: string; titulo: string },
  referencias: { slug: string; titulo: string }[]
): { slug: string; titulo: string }[] {
  const porSlug = new Map<string, { slug: string; titulo: string }>([[propia.slug, propia]]);
  for (const referencia of referencias) {
    porSlug.set(referencia.slug, { slug: referencia.slug, titulo: referencia.titulo });
  }
  return [...porSlug.values()];
}

/**
 * Dónde se usa la dirección de una página y quién la tiene abierta, sin tocar nada.
 *
 * Es lo que lee el diálogo al abrirse (y otra vez cuando el servidor le dice que algo
 * cambió). No depende de la dirección nueva, así que se pide una vez: recorrer todas las
 * versiones del ámbito en cada tecla sería excesivo. Solo cuenta lo vigente.
 */
export const consultarUsoDeDireccion = async (
  slug: string,
  ambito: Ambito,
  usuarioId?: string | null
): Promise<UsoDeLaDireccion> => {
  exigirAmbitoHabilitado(ambito);
  const pagina = await Pagina.findOne({ where: { slug, ambito } });
  if (!pagina) throw fallo('La página no existe.', 404);

  const versiones = await versionesQueEnlazan(slug, ambito, { estados: ESTADOS_VIGENTES });
  const referencias = versiones.flatMap((version) => version.referencias);
  const involucradas = paginasInvolucradas({ slug, titulo: pagina.titulo }, referencias);

  return {
    id: pagina.id,
    slug,
    titulo: pagina.titulo,
    ambito,
    protegida: esDireccionProtegida(ambito, slug),
    referencias,
    paginasConEnlaces: new Set(referencias.map((referencia) => referencia.slug)).size,
    enEdicion: await paginasEnEdicion(ambito, involucradas, usuarioId),
  };
};

/**
 * Si `entrada` sirve como dirección nueva de la página `slug`.
 *
 * La regla de la dirección es la de `@olo/slug-policy`, la misma que usa crear una página:
 * lo que se escribe se normaliza igual y las mismas direcciones están reservadas. Una
 * sola consulta (¿ya existe?), así que el diálogo puede preguntarla mientras se escribe.
 */
export const validarNuevaDireccion = async (
  slug: string,
  ambito: Ambito,
  entrada: string,
  transaction?: Transaction
): Promise<ValidacionDeDireccion> => {
  exigirAmbitoHabilitado(ambito);
  const valor = slugificar(entrada ?? '');
  const sin = (motivo: MotivoDeDireccion, mensaje: string): ValidacionDeDireccion => ({
    valor,
    valida: false,
    motivo,
    mensaje,
  });

  if (!valor) return sin('vacia', 'Escribe la nueva dirección.');
  if (valor === slug) return sin('igual', 'Es la misma dirección que tiene ahora.');

  const motivo = motivoSlugInvalido(valor);
  if (motivo) return sin('invalida', mensajeDeSlugInvalido(motivo));
  if (esDestinoReservado(ambito, valor)) {
    return sin('invalida', `La dirección /${valor} la usa el sistema. Elige otra.`);
  }

  const yaExiste = await Pagina.count({ where: { slug: valor, ambito }, transaction });
  if (yaExiste > 0) return sin('ocupada', `Ya existe una página en la dirección /${valor}.`);

  return { valor, valida: true, motivo: null, mensaje: null };
};

/** Una página cuyo contenido se reescribió, con lo que cambió en ella. */
export interface PaginaReescrita {
  paginaId: string;
  /** Su slug de después del cambio (la propia, si se enlazaba a sí misma, ya se llama distinto). */
  slug: string;
  titulo: string;
  /** Enlaces reescritos en sus versiones vigentes. */
  enlacesVigentes: number;
  /** Enlaces reescritos en su historia (rechazadas y archivadas). */
  enlacesEnHistorial: number;
  /** Los estados de las versiones que se tocaron, para decirlo en la bitácora. */
  estados: EstadoDeVersion[];
}

/** Lo que dejó el cambio, para la bitácora, la caché y la pantalla. */
export interface DireccionCambiada {
  id: string;
  slugAnterior: string;
  slug: string;
  titulo: string;
  ambito: Ambito;
  /** Enlaces reescritos en lo vigente: lo que el diálogo prometió. */
  enlacesActualizados: number;
  /** Enlaces reescritos en versiones rechazadas y archivadas. */
  enlacesEnHistorial: number;
  /** Páginas cuyo contenido se reescribió, una por página. */
  paginasReescritas: PaginaReescrita[];
  /** Lo mismo, solo con el slug y el título (lo que enseña la respuesta). */
  paginasActualizadas: { slug: string; titulo: string }[];
  clavePermisoAnterior: string;
  clavePermiso: string;
  /** Roles con la clave de permiso: hay que olvidar su caché de permisos. */
  rolesAfectados: string[];
  /** Todo slug cuya copia en caché (API y sitio) ya no vale: el viejo, el nuevo y los reescritos. */
  slugsARevalidar: { slug: string; paginaId: string; versionId: string }[];
}

const ETIQUETA_DE_ESTADO: Record<EstadoDeVersion, string> = {
  publicado: 'publicada',
  en_revision: 'en revisión',
  borrador: 'borrador',
  rechazado: 'rechazada',
  archivado: 'archivada',
};

/** `publicada, borrador` — los estados de una lista de versiones, para una frase. */
export const estadosEnPalabras = (estados: EstadoDeVersion[]): string =>
  estados.map((estado) => ETIQUETA_DE_ESTADO[estado] ?? estado).join(', ');

/**
 * Cambia la dirección de la página y, si se pide, actualiza los enlaces que la apuntaban.
 *
 * Vuelve a hacer toda la comprobación aquí, con la intención de cambiar: entre que el
 * diálogo se pintó y se pulsó el botón alguien pudo enlazarla, abrirla en el editor o crear
 * otra página con esa dirección.
 *
 * @throws {Error} 400 si la dirección no sirve o el ámbito no está habilitado; 403 si quien
 *   pide no aprueba o la página está protegida; 404 si no existe; 409 si la dirección está
 *   ocupada o su clave de permiso tiene accesos, si hay enlaces y no se pidió actualizarlos,
 *   si alguien tiene abierta una página que habría que reescribir, o si otra persona acaba
 *   de usar esa dirección.
 */
export const cambiarDireccion = async (
  slug: string,
  ambito: Ambito,
  nuevaDireccion: string,
  actualizarEnlaces: boolean,
  actor: ActorDelCambio,
  tx?: Transaction
): Promise<DireccionCambiada> => {
  // Antes de abrir nada: lo que no depende de la base.
  exigirAmbitoHabilitado(ambito);
  if (!paginasPolicies.puedeEditar(actor.rol)) {
    throw fallo('No tienes permisos para editar páginas.', 403);
  }

  const execute = async (transaction: Transaction): Promise<DireccionCambiada> => {
    // Un cambio de dirección a la vez por ámbito. Lo suelta Postgres al cerrar la
    // transacción, con éxito o con error.
    await sequelize.query('SELECT pg_advisory_xact_lock(hashtext(:clave))', {
      replacements: { clave: `cambiar-direccion:${ambito}` },
      transaction,
    });

    const pagina = await Pagina.findOne({
      where: { slug, ambito },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!pagina) throw fallo('La página no existe.', 404);

    if (esDireccionProtegida(ambito, slug)) {
      throw fallo(`La dirección /${slug} la usa el sistema y no se puede cambiar.`, 403);
    }

    const validacion = await validarNuevaDireccion(slug, ambito, nuevaDireccion, transaction);
    if (!validacion.valida) {
      throw fallo(
        validacion.mensaje ?? 'La dirección no sirve.',
        validacion.motivo === 'ocupada' ? 409 : 400
      );
    }
    const nuevo = validacion.valor;

    // Leído dentro de la transacción y con las versiones bloqueadas: se reescribe lo que
    // hay ahora, no una foto de hace un momento.
    const versiones = await versionesQueEnlazan(slug, ambito, {
      estados: ESTADOS_A_REESCRIBIR,
      transaction,
      bloquear: true,
    });
    const vigentes = versiones.filter((version) => esVigente(version.estado));
    const referenciasVigentes = vigentes.flatMap((version) => version.referencias);

    if (referenciasVigentes.length > 0 && !actualizarEnlaces) {
      throw fallo(
        `Hay ${referenciasVigentes.length} enlace(s) a /${slug} en el portal y no se pidió ` +
          'actualizarlos. Revisa la lista y confirma de nuevo.',
        409
      );
    }

    // Con las versiones ya bloqueadas: el candado se mira después, no antes, para que nadie
    // pueda abrir el editor entre la comprobación y la reescritura sin que lo veamos. Las
    // archivadas no cuentan: nadie las abre en el editor, solo se restauran.
    const enEdicion = await paginasEnEdicion(
      ambito,
      paginasInvolucradas(
        { slug, titulo: pagina.titulo },
        versiones
          .filter((version) => version.estado !== 'archivado')
          .map((version) => ({ slug: version.paginaSlug, titulo: version.paginaTitulo }))
      ),
      actor.usuarioId
    );
    if (enEdicion.length > 0) {
      const quien = enEdicion.map((p) => `«${p.titulo}» (${p.usuario})`).join(', ');
      throw fallo(
        `No se puede cambiar la dirección mientras alguien tiene abierto el editor: ${quien}. ` +
          'Se libera sola unos minutos después de cerrarlo; espera e inténtalo de nuevo.',
        409
      );
    }

    // La clave de permiso de la dirección nueva: si ya existe con accesos concedidos,
    // renombrar los uniría con los de esta página sin que nadie lo decidiera.
    const clavePermisoAnterior = claveDeSeccion(ambito, slug);
    const clavePermiso = claveDeSeccion(ambito, nuevo);
    const permiso = await Permission.findOne({ where: { name: clavePermisoAnterior }, transaction });
    const existente = await Permission.findOne({ where: { name: clavePermiso }, transaction });
    if (existente) {
      const [[{ total }]] = (await sequelize.query(
        'SELECT count(*)::int AS total FROM roles_permisos WHERE permiso_id = :permisoId',
        { replacements: { permisoId: existente.id }, transaction }
      )) as unknown as [[{ total: number }], unknown];
      if (total > 0) {
        throw fallo(
          `La clave de permiso de /${nuevo} ya tiene accesos concedidos a otros roles. ` +
            'Elige otra dirección o quita esos accesos desde el panel de roles.',
          409
        );
      }
      // Una clave huérfana (sin concesiones) de una página que ya no existe: se retira y
      // se renombra la de esta página en su lugar.
      if (permiso) await existente.destroy({ transaction });
    }

    // Se reescribe cada versión con enlaces. Antes de renombrar, para que la comprobación
    // de «a dónde lleva» siga siendo la del slug viejo.
    const nuevoHref = resolverHref(nuevo, ambito);
    const llevaAqui = (ruta: string) => rutaLlevaAPagina(ruta, slug, ambito);
    const reescritas = new Map<string, PaginaReescrita>();
    for (const version of versiones) {
      const { contenido, cambiados } = reemplazarEnlaces(version.contenido, llevaAqui, nuevoHref);
      if (cambiados === 0) continue;
      await PaginaVersion.update({ contenido }, { where: { id: version.versionId }, transaction });

      const slugDespues = version.paginaSlug === slug ? nuevo : version.paginaSlug;
      const hecha =
        reescritas.get(version.paginaId) ??
        {
          paginaId: version.paginaId,
          slug: slugDespues,
          titulo: version.paginaTitulo,
          enlacesVigentes: 0,
          enlacesEnHistorial: 0,
          estados: [],
        };
      if (esVigente(version.estado)) hecha.enlacesVigentes += cambiados;
      else hecha.enlacesEnHistorial += cambiados;
      if (!hecha.estados.includes(version.estado)) hecha.estados.push(version.estado);
      reescritas.set(version.paginaId, hecha);
    }

    try {
      await pagina.update({ slug: nuevo }, { transaction });
    } catch (error) {
      // Otra persona tomó esa dirección entre la comprobación y el cambio.
      if (error instanceof UniqueConstraintError) {
        throw fallo(`Acaban de usar la dirección /${nuevo}. Elige otra.`, 409);
      }
      throw error;
    }

    // El candado que quedara (caducado) era de la dirección vieja: no debe quedar
    // bloqueando una página futura con ese nombre.
    await sequelize.query('DELETE FROM bloqueos_edicion WHERE ambito = :ambito AND slug = :slug', {
      replacements: { ambito, slug },
      transaction,
    });

    // La clave de permiso se construye desde el slug. Se renombra la fila y no se crea otra:
    // las concesiones a roles cuelgan de su id, y así nadie pierde el acceso.
    let rolesAfectados: string[] = [];
    if (permiso) {
      const [filas] = await sequelize.query(
        `SELECT r.nombre FROM roles_permisos rp
           JOIN roles r ON r.id = rp.rol_id
          WHERE rp.permiso_id = :permisoId`,
        { replacements: { permisoId: permiso.id }, transaction }
      );
      rolesAfectados = (filas as { nombre: string }[]).map((fila) => fila.nombre);
      await permiso.update({ name: clavePermiso }, { transaction });
    }

    // Solo con la transacción confirmada: si se deshace, los roles siguen teniendo la clave
    // vieja y olvidar su caché de permisos antes de tiempo les dejaría sin acceso un rato.
    transaction.afterCommit(() => rolesAfectados.forEach(invalidarPermisosDeRol));

    // La dirección vieja ya no existe y la nueva todavía no se ha servido: las dos hay que
    // tirarlas de la caché, y también cada página cuyo contenido cambió.
    const versionPublicada = pagina.versionPublicadaId ?? '';
    const aRevalidar = new Map<string, { slug: string; paginaId: string; versionId: string }>();
    aRevalidar.set(slug, { slug, paginaId: pagina.id, versionId: versionPublicada });
    aRevalidar.set(nuevo, { slug: nuevo, paginaId: pagina.id, versionId: versionPublicada });
    for (const version of versiones) {
      const slugActual = version.paginaSlug === slug ? nuevo : version.paginaSlug;
      if (!aRevalidar.has(slugActual)) {
        aRevalidar.set(slugActual, {
          slug: slugActual,
          paginaId: version.paginaId,
          versionId: version.versionId,
        });
      }
    }

    const paginasReescritas = [...reescritas.values()];
    return {
      id: pagina.id,
      slugAnterior: slug,
      slug: nuevo,
      titulo: pagina.titulo,
      ambito,
      enlacesActualizados: paginasReescritas.reduce((suma, p) => suma + p.enlacesVigentes, 0),
      enlacesEnHistorial: paginasReescritas.reduce((suma, p) => suma + p.enlacesEnHistorial, 0),
      paginasReescritas,
      paginasActualizadas: paginasReescritas.map(({ slug: s, titulo }) => ({ slug: s, titulo })),
      clavePermisoAnterior,
      clavePermiso,
      rolesAfectados,
      slugsARevalidar: [...aRevalidar.values()],
    };
  };

  return tx ? execute(tx) : sequelize.transaction(execute);
};
