import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
// `file-type` v16 y no la del sitio: ver la nota en `guardar-excel-de-carga.ts`.
import { fromBuffer as detectarTipoDeArchivo } from 'file-type';
import { validarArchivoSubido, fueRechazada } from '@olo/upload-policy';
import sequelize from '../../config/database';
import { ConfiguracionRepository } from '../../repositories/configuracion.repository';
import { directorioDeIdentidadDelPanel } from '../../infrastructure/storage/filesystem';
import { logAudit, type ContextoAuditoria } from '../auditoria/audit.usecase';
import type { CampoModificado } from '../../repositories/auditoria.repository';
import {
  identidadGuardadaSchema,
  type CambiosDeIdentidad,
  type IdentidadGuardada,
  type PiezaDeIdentidad,
} from '../../validators/configuracion.validators';

/** La fila de `configuracion` que guarda la identidad (sembrada por la migración 044). */
const CLAVE = 'identidad-panel';

const KB = 1024;

/**
 * Más estrecho que `@olo/upload-policy`, que admite 10 MB por imagen: el logo y el icono
 * se descargan en cada carga del panel, y un PNG de varios megas para 64 px de alto solo
 * hace lento el panel de todos.
 */
const LIMITE_POR_PIEZA: Record<PiezaDeIdentidad, number> = {
  logo: 1024 * KB,
  icono: 512 * KB,
};

/** De la lista blanca de la política, solo las imágenes: un PDF no es un logo. */
const EXTENSIONES_DE_IMAGEN = new Set(['png', 'jpg']);

/** Cómo se llama cada pieza en la bitácora. */
const CAMPO_DE_PIEZA: Record<PiezaDeIdentidad, string> = {
  logo: 'logo_del_panel',
  icono: 'icono_del_panel',
};

/** Lo que el panel recibe: lo guardado, con lo que falta ya resuelto. */
export interface IdentidadPanel {
  /** Nombre del archivo en `panel/identidad/`, o `null` para el de fábrica. */
  logo: string | null;
  icono: string | null;
  blancoEnModoOscuro: boolean;
  /** Solo las acciones con color propio; las demás van con el de fábrica. */
  acciones: NonNullable<IdentidadGuardada['acciones']>;
  actualizadoEn: string | null;
}

const errorConEstado = (mensaje: string, status: number) => Object.assign(new Error(mensaje), { status });

/**
 * Lo guardado, leído con el mismo esquema que valida las escrituras. Si alguien dejó la
 * fila con algo que no encaja (a mano, o una versión anterior), el panel vuelve a la de
 * fábrica en vez de pintar un valor que nadie validó.
 */
const interpretar = (valor: unknown): IdentidadGuardada => {
  const resultado = identidadGuardadaSchema.safeParse(valor);
  if (resultado.success) return resultado.data;
  console.warn('[Identidad del panel] Valor guardado no válido; se usa el de fábrica.', resultado.error.issues);
  return {};
};

const aDto = (guardada: IdentidadGuardada, actualizadoEn: Date | null): IdentidadPanel => ({
  logo: guardada.logo ?? null,
  icono: guardada.icono ?? null,
  // El logo de fábrica es oscuro sobre transparente y en modo oscuro se pinta en blanco.
  blancoEnModoOscuro: guardada.blancoEnModoOscuro ?? true,
  acciones: guardada.acciones ?? {},
  actualizadoEn: actualizadoEn ? actualizadoEn.toISOString() : null,
});

/** `GET /api/configuracion/identidad-panel`. */
export async function obtenerIdentidadPanel(): Promise<IdentidadPanel> {
  const fila = await ConfiguracionRepository.leer(CLAVE);
  return aDto(interpretar(fila?.valor), fila?.updated_at ?? null);
}

/** «aprobar: #7db728 / #ffffff · rechazar: de fábrica», para leerlo en la bitácora. */
const describirAcciones = (acciones: IdentidadGuardada['acciones'], ids: string[]) =>
  ids
    .map((id) => {
      const colores = acciones?.[id];
      return `${id}: ${colores ? `${colores.fondo} / ${colores.texto}` : 'de fábrica'}`;
    })
    .join(' · ');

/** Los ids cuyo color cambió entre dos conjuntos. */
const accionesCambiadas = (antes: IdentidadGuardada['acciones'], despues: IdentidadGuardada['acciones']) => {
  const ids = new Set([...Object.keys(antes ?? {}), ...Object.keys(despues ?? {})]);
  return [...ids].filter((id) => {
    const a = antes?.[id];
    const d = despues?.[id];
    return a?.fondo !== d?.fondo || a?.texto !== d?.texto;
  });
};

/**
 * `PATCH /api/configuracion/identidad-panel`: los colores y el ajuste del logo en modo
 * oscuro. Si no cambió nada, no escribe ni deja fila en la bitácora.
 */
export async function actualizarIdentidadPanel(
  cambios: CambiosDeIdentidad,
  actualizadoPor: string | null,
  contexto: ContextoAuditoria
): Promise<IdentidadPanel> {
  const { fila, campos } = await sequelize.transaction(async (tx) => {
    const actual = await ConfiguracionRepository.leer(CLAVE, tx);
    const antes = interpretar(actual?.valor);
    const despues: IdentidadGuardada = { ...antes, ...cambios };

    const campos: CampoModificado[] = [];
    if (cambios.acciones !== undefined) {
      const ids = accionesCambiadas(antes.acciones, despues.acciones);
      if (ids.length > 0) {
        campos.push({
          campo: 'colores_de_acciones',
          antes: describirAcciones(antes.acciones, ids),
          despues: describirAcciones(despues.acciones, ids),
        });
      }
    }
    const blancoAntes = antes.blancoEnModoOscuro ?? true;
    if (cambios.blancoEnModoOscuro !== undefined && cambios.blancoEnModoOscuro !== blancoAntes) {
      campos.push({ campo: 'blanco_en_modo_oscuro', antes: blancoAntes, despues: cambios.blancoEnModoOscuro });
    }

    if (campos.length === 0) return { fila: actual, campos };
    return { fila: await ConfiguracionRepository.guardar(CLAVE, despues, actualizadoPor, tx), campos };
  });

  if (fila && campos.length > 0) {
    await logAudit({ ...contexto, entidadId: fila.id, entidadTipo: 'configuracion', accion: 'actualizar', camposModificados: campos });
  }
  return aDto(interpretar(fila?.valor), fila?.updated_at ?? null);
}

/**
 * Borra un archivo de identidad que ya no nombra la fila. Un fallo no tumba la petición:
 * el cambio ya está guardado, y lo peor que deja es un archivo suelto en la carpeta.
 */
const borrarArchivo = async (nombre: string | null | undefined) => {
  if (!nombre) return;
  await fs.unlink(path.join(directorioDeIdentidadDelPanel(), nombre)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') console.error(`[Identidad del panel] No se pudo borrar ${nombre}:`, error);
  });
};

/**
 * Cambia la imagen de una pieza: guarda la nueva, apunta la fila a ella, borra la
 * anterior y lo deja en la bitácora. Con `datos = null` vuelve a la de fábrica.
 *
 * El archivo se escribe antes de la transacción y se borra si la transacción falla: al
 * revés, la fila podría quedar nombrando un archivo que no existe.
 */
async function cambiarImagen(
  pieza: PiezaDeIdentidad,
  nombreNuevo: string | null,
  actualizadoPor: string | null,
  contexto: ContextoAuditoria
): Promise<IdentidadPanel> {
  let anterior: string | null | undefined;
  const fila = await sequelize
    .transaction(async (tx) => {
      const actual = await ConfiguracionRepository.leer(CLAVE, tx);
      const guardada = interpretar(actual?.valor);
      anterior = guardada[pieza];
      return ConfiguracionRepository.guardar(CLAVE, { ...guardada, [pieza]: nombreNuevo }, actualizadoPor, tx);
    })
    .catch(async (error) => {
      await borrarArchivo(nombreNuevo);
      throw error;
    });

  // Restablecer lo que ya estaba de fábrica no cambia nada: ni archivo que borrar ni fila
  // que dejar en la bitácora.
  if ((anterior ?? null) === nombreNuevo) return aDto(interpretar(fila.valor), fila.updated_at);
  await borrarArchivo(anterior);

  await logAudit({
    ...contexto,
    entidadId: fila.id,
    entidadTipo: 'configuracion',
    accion: 'actualizar',
    camposModificados: [
      {
        campo: CAMPO_DE_PIEZA[pieza],
        antes: anterior ? 'Personalizado' : 'De fábrica',
        despues: nombreNuevo ? 'Personalizado' : 'De fábrica',
      },
    ],
  });
  return aDto(interpretar(fila.valor), fila.updated_at);
}

/**
 * `POST /api/configuracion/identidad-panel/{logo|icono}`.
 *
 * Los controles de `@olo/upload-policy` (tipo real por magic bytes, lista blanca, nombre
 * UUID) más dos propios: solo PNG o JPG —sin SVG, que la política ya excluye porque
 * ejecuta script— y el límite de cada pieza.
 *
 * @throws Error con `status` 400, 413 o 415 si el archivo no sirve.
 */
export async function subirImagenDeIdentidad(
  pieza: PiezaDeIdentidad,
  datos: Buffer,
  actualizadoPor: string | null,
  contexto: ContextoAuditoria
): Promise<IdentidadPanel> {
  const resultado = await validarArchivoSubido(datos, detectarTipoDeArchivo, () => crypto.randomUUID());
  if (fueRechazada(resultado)) throw errorConEstado(resultado.error, resultado.status);
  if (!EXTENSIONES_DE_IMAGEN.has(resultado.ext)) throw errorConEstado('Solo se aceptan imágenes PNG o JPG.', 415);
  if (datos.length > LIMITE_POR_PIEZA[pieza]) {
    throw errorConEstado(`La imagen supera el límite de ${LIMITE_POR_PIEZA[pieza] / KB} KB.`, 413);
  }

  const directorio = directorioDeIdentidadDelPanel();
  await fs.mkdir(directorio, { recursive: true });
  await fs.writeFile(path.join(directorio, resultado.nombreArchivo), datos);

  return cambiarImagen(pieza, resultado.nombreArchivo, actualizadoPor, contexto);
}

/** `DELETE /api/configuracion/identidad-panel/{logo|icono}`: vuelve a la de fábrica. */
export function restablecerImagenDeIdentidad(
  pieza: PiezaDeIdentidad,
  actualizadoPor: string | null,
  contexto: ContextoAuditoria
): Promise<IdentidadPanel> {
  return cambiarImagen(pieza, null, actualizadoPor, contexto);
}
