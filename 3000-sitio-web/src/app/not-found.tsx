import Link from 'next/link';

/**
 * Lo que se ve al pedir una dirección que no existe: el mensaje sobre fondo blanco. Por
 * ahora es una pantalla sencilla.
 *
 * Todas las direcciones las resuelve el comodín `[...puckPath]`, que llama a `notFound()`
 * cuando no hay página; Next pinta este archivo dentro del layout de `app/(pages)/`, así
 * que la cabecera y el pie del sitio siguen alrededor (y el visitante puede navegar sin
 * esperar). No lleva `<main>` propio porque el layout ya tiene uno. Las migas de pan no
 * salen: sin la página actual no tienen nada que decir.
 *
 * Los colores van fijos y no de las variables del tema: la pantalla es blanca por diseño y
 * con texto oscuro, de modo que se lee igual en cualquier modo del sitio.
 *
 * No redirige sola a la portada: una redirección con tiempo es un fallo de WCAG 2.2.1 y
 * 2.2.4 (técnica F40) y desorienta a quien usa un lector de pantalla. Solo está el enlace.
 */
export default function NoEncontrada() {
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 bg-white px-4 py-10 text-center text-[#002237]">
      <h1 className="text-xl font-semibold sm:text-2xl">La página que busca no existe.</h1>
      <p className="max-w-xl text-base">
        Compruebe que la dirección URL esté bien escrita, o vaya a la{' '}
        <Link href="/inicio" className="font-semibold underline underline-offset-2">
          página principal del sitio
        </Link>
        .
      </p>
    </section>
  );
}
