// Al publicarse una página, borra de Redis sus respuestas cacheadas para que nadie vea la versión anterior.

import { borrarClavesPorPatron } from '../../../infrastructure/redis';
import type { ContenidoPublicadoEvent } from '../contenido-publicado.event';

/**
 * Los caracteres que Redis interpreta como comodines dentro de un MATCH.
 *
 * Hoy los slugs los genera `@olo/slug-policy` y no pueden contenerlos, pero el slug
 * llega desde una fila de la base de datos: escaparlo cuesta una línea y evita que un
 * slug inesperado convierta este borrado puntual en un borrado ancho.
 *
 * Ojo con el template: `\${caracter}` (una sola barra) escapa el dólar y devuelve el
 * texto literal «${caracter}»; hacen falta dos barras para anteponer una `\` real.
 */
const escaparGlob = (valor: string) => valor.replace(/[\*?[\]]/g, (caracter) => `\\${caracter}`);

/**
 * Tira de Redis la respuesta cacheada de la página que se acaba de publicar.
 *
 * La clave la construye `cacheInterceptor` como
 * `cache:{baseUrl}{path}|{cabecera}={valor}`, que para esta ruta es
 * `cache:/api/paginas/publica/{slug}|x-ambito={valor}`. Aquí se borra por patrón sobre
 * la parte de la cabecera en lugar de reconstruir la clave exacta, y es a propósito:
 * el valor que entra en la clave es el que mandó el cliente **en crudo**, mientras que
 * el ámbito con el que se sirvió la respuesta es el que sale de `resolverAmbito`, que
 * normaliza cualquier valor desconocido a 'sitio'. O sea que la misma página vive
 * detrás de `|x-ambito=sitio`, de `|x-ambito=` (sin cabecera) y de tantas variantes
 * como valores raros haya recibido. Enumerarlas es imposible; el patrón las alcanza
 * todas.
 *
 * El efecto secundario es que también se tira la entrada del otro ámbito con el mismo
 * slug —`/inicio` existe en las dos aplicaciones—. Cuesta una consulta a la base la
 * próxima vez que alguien la pida, y a cambio no hay forma de dejar contenido viejo
 * servido.
 */
export const invalidarCacheListener = async (evento: ContenidoPublicadoEvent): Promise<void> => {
  const patron = `cache:/api/paginas/publica/${escaparGlob(evento.slug)}|*`;
  const patronIndice = 'cache:/api/paginas/indice-busqueda|*';

  const [borradasPagina, borradasIndice] = await Promise.all([
    borrarClavesPorPatron(patron),
    borrarClavesPorPatron(patronIndice),
  ]);

  const totalBorradas = borradasPagina + borradasIndice;
  if (totalBorradas > 0) {
    console.log(
      `[invalidar-cache] ${borradasPagina} entrada(s) borradas para ${patron}, ${borradasIndice} para índice de búsqueda`
    );
  }
};
