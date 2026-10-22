'use client';

import { useEffect, useState } from 'react';
import { buscarOcupaciones as consultarOcupaciones } from '../services/buscador-ocupaciones.service';
import type { ResultadoOcupacion } from '../types';

interface Respuesta {
  termino: string;
  resultados: ResultadoOcupacion[];
  /** Mensaje para la pantalla si la consulta falló; `null` si respondió bien. */
  error: string | null;
}

/**
 * Los resultados de buscar `termino` en el catálogo de ocupaciones.
 *
 * El término lo pone quien llama (sale de la URL, `?buscar=`), así que esta consulta se
 * puede enlazar, recargar y volver a ella con el botón «atrás». `termino` es el de la
 * consulta que se lanzó, no el texto del input: es el que se resalta en los resultados y
 * el del mensaje de «sin coincidencias».
 *
 * La respuesta se guarda con el término al que pertenece. De ahí salen dos cosas sin
 * efectos que ajusten el estado: `loading` es «hay término y aún no ha llegado la
 * respuesta de ESE término», y una respuesta lenta de una búsqueda vieja no pisa los
 * resultados de la nueva (el efecto la descarta al limpiarse, y aunque llegara, su
 * término ya no coincide).
 */
export function useBuscadorOcupaciones(termino: string) {
  const texto = termino.trim();
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (!texto) return;

    let vigente = true;
    consultarOcupaciones(texto)
      .then((resultados) => {
        if (vigente) setRespuesta({ termino: texto, resultados, error: null });
      })
      .catch((fallo) => {
        if (!vigente) return;
        setRespuesta({
          termino: texto,
          resultados: [],
          error: fallo instanceof Error ? fallo.message : 'No se pudo consultar el catálogo de ocupaciones.',
        });
      });

    return () => {
      vigente = false;
    };
  }, [texto]);

  const lista = Boolean(texto) && respuesta?.termino === texto ? respuesta : null;

  return {
    resultados: lista?.resultados ?? [],
    loading: Boolean(texto) && !lista,
    error: lista?.error ?? null,
  };
}
