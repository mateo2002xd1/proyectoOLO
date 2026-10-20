import { OPCIONES_ACCION, opcionesDeAccion, type FiltrosAuditoria } from '../types';

/**
 * El filtro que resulta de cambiar un campo.
 *
 * Es una función pura y no va dentro del hook porque «Categoría» y «Acción» no son
 * independientes, y esa dependencia es lo más fácil de romper sin darse cuenta: cada
 * acción pertenece a una sola categoría (Rechazo es de Administración, Expiró es de
 * Seguridad), y dos etiquetas —«Editado» y «Modificado»— comparten el verbo
 * `actualizar`, que sin la categoría traería las filas de la otra.
 *
 * - **Elegir una acción fija también la categoría.** Quien busca «Autenticado» no
 *   espera seguir viendo contenido.
 * - **Cambiar de categoría descarta una acción que ya no cabe**, en vez de dejar un
 *   filtro invisible que vacía la tabla sin explicación. Y **quitar la categoría**
 *   («Todas») descarta también la acción: sin categoría, `actualizar` mezclaría las
 *   ediciones de páginas con las modificaciones de cuentas, y la acción es de una sola.
 */
export function aplicarCambioDeFiltro(
  previos: FiltrosAuditoria,
  campo: keyof FiltrosAuditoria,
  valor: string,
): FiltrosAuditoria {
  const siguientes = { ...previos, [campo]: valor } as FiltrosAuditoria;

  if (campo === 'accion') {
    const opcion = OPCIONES_ACCION.find((o) => o.value === valor);
    if (opcion) siguientes.categoria = opcion.categoria;
  } else if (campo === 'categoria') {
    const cabe = opcionesDeAccion(siguientes.categoria).some((o) => o.value === siguientes.accion);
    if (!siguientes.categoria || !cabe) siguientes.accion = '';
  }

  return siguientes;
}
