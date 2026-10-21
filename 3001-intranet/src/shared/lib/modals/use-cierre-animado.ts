'use client';

import { useEffect, useState } from 'react';

/**
 * Lo que dura la salida de un modal; es `--olo-modal-salida` de `globals.css`, que es
 * la que manda en la animación. Si cambias una, cambia la otra.
 */
const SALIDA_DEL_MODAL_MS = 150;

/**
 * Deja montado un modal mientras hace su animación de salida.
 *
 * La entrada no necesita JavaScript: la da `@starting-style` (clases `olo-anim-fondo` y
 * `olo-anim-caja` en `globals.css`). La salida sí, porque un modal que React deja de
 * pintar desaparece en ese mismo instante y no queda nada que animar. Con este hook, al
 * pasar `abierto` a `false` el modal sigue montado `SALIDA_DEL_MODAL_MS` con `cerrando`
 * en `true` (que se pinta como `data-cerrando` en el fondo) y después se desmonta.
 *
 * Uso: `if (!montado) return null;` donde antes iba `if (!abierto) return null;`, y
 * `data-cerrando={cerrando || undefined}` en el elemento con `olo-anim-fondo`. Si se
 * vuelve a abrir mientras se cerraba, el temporizador se cancela y no parpadea.
 *
 * Si el padre monta el modal solo mientras está abierto (`{abierto && <Modal />}`), el
 * modal no llega a enterarse de que se cierra: el padre tiene que dejarlo montado y,
 * para que cada apertura empiece limpia, cambiarle la `key` al abrir (como
 * `ModalDepurarVersiones` en `respaldos-view.tsx`).
 */
export function useCierreAnimado(abierto: boolean) {
  const [montado, setMontado] = useState(abierto);

  // Al abrir se monta en el mismo render, no en un efecto: así el primer pintado ya es
  // el del modal y `@starting-style` tiene de dónde arrancar.
  if (abierto && !montado) setMontado(true);

  useEffect(() => {
    if (abierto || !montado) return;
    const reloj = window.setTimeout(() => setMontado(false), SALIDA_DEL_MODAL_MS);
    return () => window.clearTimeout(reloj);
  }, [abierto, montado]);

  return { montado, cerrando: montado && !abierto };
}

/**
 * Lo que enseña un modal mientras se va: el último valor que tuvo abierto.
 *
 * Casi todos los modales se cierran vaciando lo que pintan (el padre vuelve
 * `aEliminar` o `registro` a `null` en el mismo clic). Sin animación daba igual, porque
 * el modal desaparecía en ese instante; con ella, durante la salida se veía el título
 * cambiar o la caja quedarse vacía. Mientras `abierto` es `true` devuelve `valor` tal
 * cual; cuando pasa a `false`, el último que tuvo.
 *
 * `valor` tiene que ser el mismo entre un render y el siguiente si nada cambió: una prop
 * o un estado, no un objeto o un JSX creados en el propio render, que son nuevos cada
 * vez y harían que se guardara sin fin.
 */
export function useUltimoValorAbierto<T>(abierto: boolean, valor: T): T {
  const [ultimo, setUltimo] = useState(valor);
  if (abierto && valor !== ultimo) setUltimo(valor);
  return abierto ? valor : ultimo;
}
