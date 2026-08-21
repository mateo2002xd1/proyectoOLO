import { createHash, timingSafeEqual } from 'crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { etiquetaDePagina } from '@/features/paginas';

/**
 * Tira de la caché el contenido publicado de una página.
 *
 * La llama la API (`domain-events/paginas/listeners/revalidar-isr.listener.ts`) justo
 * después de aprobar una versión. Sin esto, aprobar cambiaba la base de datos pero no
 * la pantalla: el sitio seguía sirviendo su copia hasta que caducaba sola, y encima la
 * primera visita tras caducar todavía recibía la vieja por el `stale-while-revalidate`
 * de Next. Es lo que hacía parecer que la aprobación no había hecho nada.
 *
 * Recibe el `slug` y construye aquí la etiqueta. El formato no viaja por la red a
 * propósito: si lo mandara la API, la convención estaría escrita en dos repositorios y
 * se desincronizarían en cuanto uno de los dos la tocara.
 */

/** Ni sesión ni cookies: quien llama es un servidor, no un navegador. */
export const dynamic = 'force-dynamic';

/**
 * Se lee en cada petición y no al cargar el módulo: en Docker el secreto llega por
 * `environment:`, o sea en tiempo de ejecución y no de compilación, y una constante de
 * módulo ata el valor al primer momento en que alguien importa este archivo.
 */
const secretoConfigurado = () => process.env.REVALIDAR_SECRET ?? '';

/**
 * Forma admisible de un slug. Es una comprobación de forma, no de política: `esSlugValido`
 * de `@olo/slug-policy` rechaza los slugs reservados, y entre ellos está `menu-y-pie` —la
 * plantilla, que es justo la página que más falta hace poder revalidar—.
 */
const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LARGO_MAX_SLUG = 255;

/**
 * Comparación en tiempo constante.
 *
 * Se comparan los hashes y no las cadenas porque `timingSafeEqual` exige búferes del
 * mismo tamaño y lanza si no lo son — y esa excepción, por sí sola, ya revelaría la
 * longitud del secreto. El hash iguala los tamaños sin perder la comparación constante.
 */
function secretoCorrecto(recibido: string, esperado: string): boolean {
  const a = createHash('sha256').update(recibido).digest();
  const b = createHash('sha256').update(esperado).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  // Sin secreto configurado no se acepta nada. Dejar la ruta abierta «hasta que se
  // configure» sería dejar que cualquiera vacíe la caché del sitio a voluntad.
  const esperado = secretoConfigurado();
  if (!esperado) {
    return NextResponse.json(
      { error: 'La revalidación no está configurada en este entorno.' },
      { status: 503 }
    );
  }

  if (!secretoCorrecto(request.headers.get('x-revalidar-secreto') ?? '', esperado)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
  }

  if (typeof slug !== 'string' || slug.length > LARGO_MAX_SLUG || !SLUG_VALIDO.test(slug)) {
    return NextResponse.json({ error: 'slug inválido' }, { status: 400 });
  }

  const etiqueta = etiquetaDePagina(slug);
  // `{ expire: 0 }` es caducidad inmediata: la entrada deja de servirse ya, no en la
  // siguiente visita. Es lo que hace falta aquí, porque quien acaba de aprobar recarga
  // en el acto — servir una vez más lo viejo es justo el síntoma que esto arregla.
  //
  // Next 16 exige el segundo argumento (sin él avisa de deprecación), y `updateTag`,
  // que caduca igual de rápido, solo funciona dentro de una Server Action: desde un
  // route handler lanza. Ver `revalidate.js` en next/dist: trata `expire: 0` igual que
  // la forma antigua de un solo argumento.
  revalidateTag(etiqueta, { expire: 0 });

  return NextResponse.json({ revalidado: etiqueta });
}
