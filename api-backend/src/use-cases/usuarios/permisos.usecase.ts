import { PermissionRepository } from '../../repositories/permisos.repository';
import { CATALOGO_PERMISOS } from '../../shared/catalogo-permisos';

const POR_CLAVE = new Map(CATALOGO_PERMISOS.map((p) => [p.clave, p]));

/**
 * Los permisos, cada uno con cómo se llama y dónde se agrupa en la pantalla.
 *
 * La tabla `permisos` solo guarda la clave (`editar.intranet.tasa`), que es lo que el
 * middleware compara. Pero un administrador no debería tener que traducir eso mentalmente
 * a «la sección Tasa de vinculación de la intranet»: esa traducción vive en
 * `catalogo-permisos.ts`, junto a la API que los comprueba, y se envía ya resuelta.
 *
 * Se hace aquí y no en el panel para que no haya dos listas de etiquetas que mantener
 * sincronizadas — que es exactamente cómo el catálogo anterior acabó desviándose.
 *
 * El orden también sale del catálogo: va de menos a más poder, y el panel lo respeta.
 * Una clave que esté en la base pero no en el catálogo se devuelve igualmente, marcada
 * como huérfana, para que se vea y se pueda limpiar en vez de quedar invisible.
 */
export const getAllPermissions = async () => {
  const filas = await PermissionRepository.findAll();

  const enriquecidos = filas.map((fila: any) => {
    const clave = fila.name;
    const delCatalogo = POR_CLAVE.get(clave);

    return {
      ...(fila.toJSON ? fila.toJSON() : fila),
      etiqueta: delCatalogo?.etiqueta ?? clave,
      descripcion: delCatalogo?.descripcion ?? 'Permiso sin descripción en el catálogo.',
      grupo: delCatalogo?.grupo ?? 'huerfanos',
      esFrontera: delCatalogo?.esFrontera ?? false,
      enCatalogo: Boolean(delCatalogo),
    };
  });

  const orden = CATALOGO_PERMISOS.map((p) => p.clave);
  return enriquecidos.sort((a, b) => {
    const ia = orden.indexOf(a.name);
    const ib = orden.indexOf(b.name);
    // Las huérfanas al final: no estorban y se ven.
    return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
  });
};

export const getPermissionById = async (id: string) => {
  const perm = await PermissionRepository.findById(id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
  return perm;
};

export const createPermission = async (data: any) => {
  const existing = await PermissionRepository.findByName(data.name);
  if (existing) throw Object.assign(new Error('Ya existe un permiso con ese nombre'), { status: 409 });
  return PermissionRepository.create(data);
};

export const updatePermission = async (id: string, data: any) => {
  const perm = await PermissionRepository.findById(id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
  const [, updated] = await PermissionRepository.update(id, data);
  return updated?.[0] || perm;
};

export const deletePermission = async (id: string) => {
  const perm = await PermissionRepository.findById(id);
  if (!perm) throw Object.assign(new Error('Permiso no encontrado'), { status: 404 });
  await PermissionRepository.delete(id);
  return { message: 'Permiso eliminado' };
};
