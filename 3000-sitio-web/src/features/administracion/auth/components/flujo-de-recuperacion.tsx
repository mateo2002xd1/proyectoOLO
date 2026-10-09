'use client';

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { PreguntaDeUsuario, RespuestaDeUsuario } from '../services/recuperacion.service';

/**
 * Lo que un paso de la recuperación de contraseña le deja al siguiente.
 *
 * Desde el 2026-09-18 cada paso es una ruta propia (`/recovery`,
 * `/security-questions`, `/reset-password`, `/reset-success`), con las mismas
 * carpetas que la intranet. La intranet se pasa estos datos por `sessionStorage`,
 * **respuestas de seguridad incluidas y en claro**, que se quedan escritas en el
 * navegador hasta que algo las borra. Aquí viven en memoria, en este contexto, que
 * monta `app/(auth)/layout.tsx`: Next conserva un layout mientras se navega entre
 * las páginas que envuelve, así que los datos sobreviven al cambio de ruta y se
 * pierden solos al salir del flujo o al recargar. No hay nada que limpiar.
 *
 * El precio es que un paso no se puede abrir suelto: sin lo que dejó el anterior no
 * hay nada que pintar, y la vista devuelve al principio del flujo.
 */

/**
 * Por dónde va la recuperación de contraseña (RF-05).
 *
 * Cada etapa lleva solo lo que el paso siguiente necesita, y al terminar se suelta
 * todo: con la contraseña ya cambiada, el correo y las respuestas no sirven para nada.
 */
export type Recuperacion =
  | { etapa: 'preguntas'; email: string; preguntas: PreguntaDeUsuario[] }
  | {
      etapa: 'nueva-contrasena';
      email: string;
      preguntas: PreguntaDeUsuario[];
      /** Las que el servidor ya dio por buenas. Se vuelven a mandar al guardar. */
      respuestas: RespuestaDeUsuario[];
      /** Primer nombre de la cuenta, que el servidor da al verificar, para el saludo. */
      nombre: string | null;
    }
  | { etapa: 'terminada' };

interface FlujoDeRecuperacion {
  recuperacion: Recuperacion | null;
  empezarRecuperacion: (email: string, preguntas: PreguntaDeUsuario[]) => void;
  confirmarRespuestas: (respuestas: RespuestaDeUsuario[], nombre: string | null) => void;
  terminarRecuperacion: () => void;
}

const Contexto = createContext<FlujoDeRecuperacion | null>(null);

export function FlujoDeRecuperacionProvider({ children }: { children: ReactNode }) {
  const [recuperacion, setRecuperacion] = useState<Recuperacion | null>(null);

  const empezarRecuperacion = useCallback(
    (email: string, preguntas: PreguntaDeUsuario[]) =>
      setRecuperacion({ etapa: 'preguntas', email, preguntas }),
    []
  );

  const confirmarRespuestas = useCallback(
    (respuestas: RespuestaDeUsuario[], nombre: string | null) =>
      setRecuperacion((actual) =>
        actual && actual.etapa !== 'terminada'
          ? { etapa: 'nueva-contrasena', email: actual.email, preguntas: actual.preguntas, respuestas, nombre }
          : actual
      ),
    []
  );

  const terminarRecuperacion = useCallback(() => setRecuperacion({ etapa: 'terminada' }), []);

  const valor = useMemo(
    () => ({ recuperacion, empezarRecuperacion, confirmarRespuestas, terminarRecuperacion }),
    [recuperacion, empezarRecuperacion, confirmarRespuestas, terminarRecuperacion]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFlujoDeRecuperacion(): FlujoDeRecuperacion {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error('useFlujoDeRecuperacion necesita FlujoDeRecuperacionProvider: lo monta app/(auth)/layout.tsx.');
  }
  return valor;
}
