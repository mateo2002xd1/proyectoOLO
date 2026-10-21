/**
 * El autoguardado del editor: lo que haya sin guardar se guarda solo como borrador.
 *
 * Existe porque el editor solo guardaba al pulsar «Guardar borrador», y una pestaña
 * cerrada por error se llevaba todo lo hecho desde el último clic. Hace lo mismo que
 * ese botón, sin su confirmación; la API lo anota en la bitácora con su propio verbo
 * (`autoguardar_borrador`) para que no se lea como un guardado que alguien pulsó.
 *
 * Guarda en tres momentos:
 *
 * - **Cada 30 segundos**, si hay cambios. Intervalo fijo y no «30 s después de dejar de
 *   escribir»: con una espera que se reinicia, quien edita sin pausas no guardaría nunca.
 *   Treinta segundos es lo más que se puede perder, y como mucho dos guardados por
 *   minuto: cada uno sanea el árbol entero en la API, deja una fila en la bitácora y
 *   gasta del límite de 30 escrituras por minuto (`limitadorDeEscritura`).
 * - **Al ocultarse la pestaña** —cambiar de pestaña, minimizar, bloquear el equipo—: es
 *   la señal más fiable de que quien edita se va, y la pestaña sigue viva para terminar
 *   la petición.
 * - **Al desmontarse el editor** sin haber pasado por «Salir»: el botón «atrás» del
 *   navegador navega sin recargar y no avisa de nada.
 *
 * Cerrar o recargar la pestaña es el único caso en que no se puede guardar: el navegador
 * corta las peticiones de una página que se descarga, y `keepalive` no admite cuerpos de
 * más de 64 KB, que una página con texto enriquecido supera. Ahí lo que se hace es que
 * el navegador pregunte antes de cerrar si queda algo sin guardar.
 *
 * Quién decide si ahora se puede guardar es el editor (`puedeGuardar`), no este hook:
 * es el que sabe si hay un guardado en curso, un diálogo abierto o una versión en
 * revisión.
 *
 * Gemelo de `intranet/src/features/editor/edition/hooks/use-autoguardado.ts`.
 */
'use client';

import { useEffect, useRef } from 'react';

/** Cada cuánto se guarda solo, si hay algo que guardar. */
export const MS_ENTRE_AUTOGUARDADOS = 30_000;

interface OpcionesAutoguardado {
  /** Si hay algo sin guardar. Decide si el navegador pregunta antes de cerrar. */
  hayCambios: () => boolean;
  /** Si ahora mismo toca guardar: hay cambios y nada lo impide. */
  puedeGuardar: () => boolean;
  /** Guarda como autoguardado. Si falla, el error ya lo enseña quien guarda. */
  guardar: () => Promise<unknown>;
}

export function useAutoguardado(opciones: OpcionesAutoguardado): void {
  // En una ref y no en las dependencias del efecto: el editor pasa funciones nuevas en
  // cada render, y reiniciar el intervalo con cada una lo retrasaría sin fin. Se asigna
  // en un efecto porque escribir una ref durante el render lo prohíbe `react-hooks/refs`.
  const opcionesRef = useRef(opciones);
  useEffect(() => {
    opcionesRef.current = opciones;
  });

  useEffect(() => {
    const intentar = () => {
      const { puedeGuardar, guardar } = opcionesRef.current;
      if (puedeGuardar()) void guardar().catch(() => undefined);
    };

    const intervalo = window.setInterval(intentar, MS_ENTRE_AUTOGUARDADOS);

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'hidden') intentar();
    };

    const antesDeDescargar = (evento: BeforeUnloadEvent) => {
      if (!opcionesRef.current.hayCambios()) return;
      evento.preventDefault();
      // Los navegadores basados en Chromium anteriores a la 119 solo preguntan si,
      // además, `returnValue` trae algo.
      evento.returnValue = '';
    };

    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('beforeunload', antesDeDescargar);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('beforeunload', antesDeDescargar);
      // Última oportunidad: el editor se va con cambios y la página sigue viva.
      intentar();
    };
  }, []);
}
