/**
 * El candado que impide que dos personas editen la misma página a la vez.
 *
 * Hace falta porque el editor no guarda nada hasta que alguien pulsa «Guardar
 * borrador»: sin candado, dos personas trabajando sobre la misma página producen dos
 * versiones completas y la segunda en guardar borra el trabajo de la primera sin que
 * nadie se entere. Quien llega segundo no entra, y se le dice quién está dentro.
 *
 * El candado dura dos minutos en la base y se renueva cada 45 segundos, bastante antes
 * de que caduque. Ese margen es lo que hace que a quien está trabajando no se le caiga
 * nunca, y que una pestaña cerrada de golpe se libere sola en menos de dos minutos.
 *
 * Gemelo de `intranet/src/features/gestor-secciones/hooks/use-bloqueo-de-edicion.ts`.
 *
 * @see api-backend/src/use-cases/paginas/adquirir-bloqueo.usecase.ts
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adquirirBloqueo,
  descartarEdicion,
  type EstadoDelBloqueo,
} from '../services/edicion.service';

/** Un poco por debajo de los 2 minutos que dura el candado en la base. */
const MS_ENTRE_LATIDOS = 45_000;

export type EstadoDeBloqueo =
  /** Todavía se está pidiendo: no se sabe nada. */
  | 'pidiendo'
  /** Es nuestro: se puede editar. */
  | 'propio'
  /** Lo tiene otra persona: no se entra. */
  | 'ajeno'
  /** Lo teníamos y nos lo quitaron: se puede mirar, pero ya no guardar. */
  | 'perdido';

export interface Bloqueo {
  estado: EstadoDeBloqueo;
  /** Quién lo tiene, cuando no es nuestro. */
  bloqueadoPor: string | null;
  /** Si a esta persona le sale «Entrar de todos modos». */
  puedeForzar: boolean;
  /** Reintentar, o quitárselo a quien lo tenga si `forzar`. */
  reintentar: (forzar?: boolean) => void;
}

export function useBloqueoDeEdicion(slug: string): Bloqueo {
  const [estado, setEstado] = useState<EstadoDeBloqueo>('pidiendo');
  const [bloqueadoPor, setBloqueadoPor] = useState<string | null>(null);
  const [puedeForzar, setPuedeForzar] = useState(false);
  // Sube con cada «Reintentar»: es lo que vuelve a disparar el efecto.
  const [intento, setIntento] = useState(0);
  const forzarRef = useRef(false);

  const reintentar = useCallback((forzar = false) => {
    forzarRef.current = forzar;
    setEstado('pidiendo');
    setIntento((n) => n + 1);
  }, []);

  useEffect(() => {
    let vigente = true;
    // Si nunca llegamos a tenerlo, al salir no hay nada que soltar (y soltar sin
    // tenerlo sería pedirle a la API que borre el candado de otro).
    let loTuvimos = false;

    const aplicar = (respuesta: EstadoDelBloqueo, esLatido: boolean) => {
      if (!vigente) return;

      if (respuesta.propio) {
        loTuvimos = true;
        setEstado('propio');
        setBloqueadoPor(null);
        return;
      }

      // Perderlo en mitad de la sesión no es lo mismo que encontrarlo ocupado al
      // llegar: significa que alguien nos lo quitó mientras editábamos, y la pantalla
      // tiene que decirlo distinto y dejar de permitir guardar.
      setEstado(esLatido && loTuvimos ? 'perdido' : 'ajeno');
      setBloqueadoPor(respuesta.bloqueadoPor?.nombre ?? 'Otra persona');
      setPuedeForzar(respuesta.puedeForzar);
      // Sin candado no hay nada que renovar: seguir latiendo solo serviría para
      // pedirle a la API cada 45 segundos algo que ya sabemos que va a decir que no.
      clearInterval(temporizador);
    };

    const pedir = (esLatido: boolean) =>
      adquirirBloqueo(slug, !esLatido && forzarRef.current)
        .then((r) => aplicar(r, esLatido))
        // Un fallo de red en un latido no debe echar a nadie del editor: se reintenta
        // en el siguiente. Lo que corta de verdad es que la API diga que ya no es
        // nuestro, y eso llega como respuesta, no como error.
        .catch(() => undefined)
        .finally(() => {
          forzarRef.current = false;
        });

    // El intervalo se crea ANTES de la primera petición para que `aplicar` —que puede
    // querer pararlo— siempre lo encuentre ya inicializado: la respuesta a esa primera
    // petición llega en una microtarea, o sea después de este bloque.
    const temporizador = setInterval(() => void pedir(true), MS_ENTRE_LATIDOS);
    void pedir(false);

    /**
     * Soltar el candado al irse.
     *
     * `pagehide` cubre cerrar la pestaña, que es donde el `return` del efecto no llega
     * a ejecutarse. `liberarBloqueo` va con `keepalive` justamente para eso.
     */
    const soltar = () => {
      if (loTuvimos) void descartarEdicion(slug);
    };
    window.addEventListener('pagehide', soltar);

    return () => {
      vigente = false;
      clearInterval(temporizador);
      window.removeEventListener('pagehide', soltar);
      soltar();
    };
  }, [slug, intento]);

  return { estado, bloqueadoPor, puedeForzar, reintentar };
}
