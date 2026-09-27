import { PermissionRepository } from '../../repositories/permisos.repository';
import { Pagina } from '../../infrastructure/db/models';
import {
  CATALOGO_PERMISOS,
  partesDeClaveDeSeccion,
  permisoDeSeccion,
} from '../../shared/catalogo-permisos';

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
 * como huérfana, para que se vea en vez de quedar invisible. Las retira
 * `npm run sembrar:permisos`, que reconcilia la tabla con el catálogo.
 */
export const getAllPermissions = async () => {
  const filas = await PermissionRepository.findAll();

  /**
   * Los títulos de las secciones creadas desde el editor.
   *
   * El catálogo estático no puede conocerlas: su nombre lo escribió una persona y
   * vive en `paginas.titulo`. Sin esta consulta, la clave `editar.intranet.bolsa-de-
   * empleo` caía en «huérfana» y el panel la ofrecía como un permiso roto en vez de
   * como «Bolsa de empleo», que es la sección que de verdad concede.
   *
   * Una consulta para todas, no una por clave: son pocas filas y esto se pinta cada
   * vez que se abre el modal de permisos.
   */
  const paginas = (await Pagina.findAll({ attributes: ['ambito', 'slug', 'titulo'] })) as any[];
  const tituloPorClave = new Map<string, { ambito: 'sitio' | 'intranet'; titulo: string }>();
  for (const pagina of paginas) {
    tituloPorClave.set(`${pagina.ambito}.${pagina.slug}`, {
      ambito: pagina.ambito,
      titulo: pagina.titulo,
    });
  }

  /** El descriptor de una clave de sección que el catálogo estático no lista. */
  const descriptorDinamico = (clave: string) => {
    const partes = partesDeClaveDeSeccion(clave);
    if (!partes) return undefined;

    const pagina = tituloPorClave.get(`${partes.ambito}.${partes.slug}`);
    // Sin página detrás la clave sí está huérfana de verdad: la sección se borró.
    if (!pagina) return undefined;

    return permisoDeSeccion(partes.ambito, partes.slug, pagina.titulo);
  };

  const enriquecidos = filas.map((fila: any) => {
    const clave = fila.name;
    const delCatalogo = POR_CLAVE.get(clave) ?? descriptorDinamico(clave);

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
