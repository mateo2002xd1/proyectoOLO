'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { IconoMascara } from '@/shared/ui/atoms/icono-mascara';
import { buscarEnPanel } from '../lib/indice-panel';

/**
 * Buscador del panel: una capa que tapa la pantalla entera con el campo al centro,
 * en vertical y en horizontal cuando está vacío.
 *
 * Ocupa el 100 % del alto y del ancho —blanco en modo claro, azul oscuro
 * (`#0b1121`, el mismo `--background` que ya usa el panel) en oscuro— en vez de ser
 * una caja flotante: al buscar no hay nada del panel que mirar de fondo, y una capa
 * opaca evita el bizqueo entre lo de detrás y lo de delante.
 *
 * La lista de resultados solo aparece con algo escrito —vacío no muestra el mapa
 * completo del panel, que era ruido antes de buscar nada—; `buscarEnPanel` ya
 * busca por título, descripción, grupo y sinónimos, así que cada resultado es una
 * relación real con lo tecleado, no una coincidencia de texto literal. Cada uno es
 * un enlace de verdad (para clic central y «copiar dirección»), y `Enter` lleva
 * directo al primero sin necesidad de bajar el mouse hasta la lista.
 */
export function BuscadorModal({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [consulta, setConsulta] = useState('');
  const [flechaEntrada, setFlechaEntrada] = useState(false);

  const resultados = useMemo(() => buscarEnPanel(consulta), [consulta]);

  /**
   * Cierra volviendo a lo anterior.
   *
   * Si se llegó aquí escribiendo la URL a mano no hay «anterior» dentro del panel y
   * `back()` sacaría del sitio; en ese caso se vuelve al dashboard.
   */
  const cerrar = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      if (window.history.length > 1) router.back();
      else router.push('/admin/dashboard');
    }
  }, [router, onClose]);

  // El campo recibe el foco al abrir. Se hace con `ref` y no con el atributo
  // `autoFocus`, que la configuración de accesibilidad del proyecto prohíbe (§154 de
  // `9-accesibilidad.md`): aquí es correcto porque el foco *debe* entrar al diálogo.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // La flecha entra deslizándose de izquierda a derecha al abrir el buscador.
  // Arranca fuera de su sitio (`-translate-x`) y en el siguiente frame se suelta a
  // `translate-x-0`; sin ese frame de por medio el navegador pinta ya en la
  // posición final y la transición no llega a verse.
  useEffect(() => {
    const id = requestAnimationFrame(() => setFlechaEntrada(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Mientras la capa está encima, lo de debajo no se desplaza: sin esto, la rueda
  // del ratón sobre el fondo mueve el panel que hay detrás de la capa.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  const irA = useCallback(
    (href: string | undefined) => {
      if (!href) return;
      if (onClose) onClose();
      if (href.startsWith('http://') || href.startsWith('https://')) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    },
    [router, onClose]
  );

  const alPulsarTecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      cerrar();
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      irA(resultados[0]?.href);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en el panel"
      // Solo entrada (`@starting-style`): es una capa opaca que el panel monta mientras está
      // abierta (o la página `/admin/buscar`), y al cerrar no hay nada que fundir.
      className="olo-anim-fondo fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-white px-4 dark:bg-[#0b1121]"
    >
      {/* Se aparta del borde derecho para no caer debajo del conmutador de tema, que
          está fijo en `top-4 right-4` con un z-index mayor. */}
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar el buscador"
        className="absolute top-4 right-20 rounded-full p-2 text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-focus)] dark:text-[#94a3b8]"
      >
        {/* El icono de cerrar del usuario (2026-10-15), antes una flecha hacia la izquierda.
            Mantiene la entrada animada. */}
        <span
          className={`flex transition-transform duration-300 ease-out ${flechaEntrada ? 'translate-x-0' : '-translate-x-2'}`}
        >
          <IconoMascara nombre="cerrar" tamano="h-5 w-5" />
        </span>
      </button>

      <div className="mx-auto w-full max-w-2xl">
        <label htmlFor="buscador-panel" className="sr-only">
          Buscar en el panel
        </label>

        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-zinc-400 dark:text-[#94a3b8]" />
          <input
            ref={inputRef}
            id="buscador-panel"
            type="search"
            autoComplete="off"
            placeholder="Buscar en el panel…"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={alPulsarTecla}
            // `type="search"` trae de fábrica una "x" para vaciar el campo (WebKit)
            // o un ojo/borrador (Edge/IE): se apagan a mano, el campo ya tiene su
            // propia forma de vaciarse (seleccionar y borrar, o Escape para cerrar).
            className="h-16 w-full rounded-[32px] border border-[#d9d9d9] bg-white pr-5 pl-14 text-lg text-zinc-950 shadow-sm transition-colors outline-none placeholder:text-zinc-400 focus:border-transparent focus:ring-2 focus:ring-[var(--color-brand-focus)] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden dark:border-[#1e293b] dark:bg-[#131b2f] dark:text-[#f6f6f6] dark:placeholder:text-[#94a3b8]"
          />
        </div>

        {/* El recuento se anuncia solo al cambiar; sin esto, quien no ve la lista no
            sabe si lo que escribe encuentra algo. */}
        <p aria-live="polite" className="sr-only">
          {consulta.trim() &&
            (resultados.length === 0
              ? 'Sin resultados'
              : `${resultados.length} ${resultados.length === 1 ? 'resultado' : 'resultados'}`)}
        </p>

        {consulta.trim() &&
          (resultados.length === 0 ? (
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-[#94a3b8]">
              No hay nada en el panel que coincida con «{consulta.trim()}».
            </p>
          ) : (
            <ul aria-label="Resultados" className="mt-6 max-h-[45dvh] space-y-1 overflow-y-auto">
              {resultados.map((destino) => (
                <li key={destino.id} className="rounded-[16px]">
                  <Link
                    href={destino.href}
                    onClick={() => onClose?.()}
                    className="block rounded-[16px] px-4 py-3 no-underline transition-colors hover:bg-zinc-100 dark:hover:bg-[#131b2f]"
                  >
                    <span className="block text-base font-medium text-zinc-950 dark:text-[#f6f6f6]">
                      {destino.titulo}
                    </span>
                    <span className="block text-sm text-zinc-500 dark:text-[#94a3b8]">
                      {destino.descripcion}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-400 dark:text-[#7c8db0]">
                      {destino.grupo}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}
