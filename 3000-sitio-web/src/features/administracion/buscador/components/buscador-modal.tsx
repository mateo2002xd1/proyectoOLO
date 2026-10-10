'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
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
      className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-white px-4 dark:bg-[#0b1121]"
    >
      {/* Se aparta del borde derecho para no caer debajo del conmutador de tema, que
          está fijo en `top-4 right-4` con un z-index mayor. */}
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar el buscador"
        className="absolute top-4 right-20 rounded-full p-2 text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-focus)] dark:text-[#94a3b8]"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`size-6 transition-transform duration-300 ease-out ${flechaEntrada ? 'translate-x-0' : '-translate-x-2'}`}
        >
          <g clipPath="url(#clip0_913_5987)">
            <path
              d="M4.94363 5.60661L1.02463 9.52562C0.38826 10.1925 0.0332031 11.0788 0.0332031 12.0006C0.0332031 12.9224 0.38826 13.8088 1.02463 14.4756L4.94363 18.3946C5.08201 18.5379 5.24752 18.6522 5.43053 18.7308C5.61353 18.8094 5.81036 18.8508 6.00953 18.8525C6.2087 18.8542 6.40622 18.8163 6.59057 18.7409C6.77491 18.6654 6.94239 18.5541 7.08323 18.4132C7.22407 18.2724 7.33545 18.1049 7.41087 17.9206C7.48629 17.7362 7.52424 17.5387 7.52251 17.3395C7.52078 17.1404 7.4794 16.9435 7.40079 16.7605C7.32217 16.5775 7.2079 16.412 7.06464 16.2736L4.28563 13.4926L22.5356 13.4696C22.9335 13.4696 23.315 13.3116 23.5963 13.0303C23.8776 12.749 24.0356 12.3674 24.0356 11.9696C24.0356 11.5718 23.8776 11.1903 23.5963 10.909C23.315 10.6277 22.9335 10.4696 22.5356 10.4696L4.30063 10.4926L7.06464 7.72762C7.33787 7.44471 7.48906 7.06581 7.48565 6.67251C7.48223 6.27922 7.32447 5.903 7.04636 5.62489C6.76825 5.34677 6.39203 5.18902 5.99874 5.1856C5.60544 5.18219 5.22654 5.33338 4.94363 5.60661Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="clip0_913_5987">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
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
