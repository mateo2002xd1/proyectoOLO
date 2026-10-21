import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/shared/lib/session/auth-cookies';
import { URL_DE_LA_API } from '@/shared/lib/api/url-de-la-api';
import { ICONO_APPLE } from '@/shared/lib/pwa';
import { ACCIONES_DEL_PANEL } from './acciones';
import { BOTONES_DEL_PANEL } from './botones';
import { coloresDe, coloresDeBoton, iconoDelPanel, IDENTIDAD_DE_FABRICA, type IdentidadPanel } from './identidad';

/**
 * La identidad visual del panel, leída en el servidor con la sesión de quien carga la
 * página. Aparte de `index.ts` porque usa `next/headers`, que no puede llegar a un
 * componente de cliente.
 *
 * `cache` de React: el layout la pide para el favicon (`generateMetadata`) y para pintar,
 * y así es una sola petición por carga. Si la API no responde, el panel sale con la de
 * fábrica: un logo no es motivo para que el panel no cargue.
 */
export const obtenerIdentidadPanel = cache(async (): Promise<IdentidadPanel> => {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return IDENTIDAD_DE_FABRICA;

  try {
    const respuesta = await fetch(`${URL_DE_LA_API}/api/configuracion/identidad-panel`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!respuesta.ok) return IDENTIDAD_DE_FABRICA;
    return { ...IDENTIDAD_DE_FABRICA, ...((await respuesta.json()) as Partial<IdentidadPanel>) };
  } catch {
    return IDENTIDAD_DE_FABRICA;
  }
});

/**
 * Escribe las variables de color de la identidad: las de cada etiqueta de acción
 * (`--olo-accion-{id}-fondo` y `-texto`) y las de cada tipo de botón (`--olo-boton-{id}-…`).
 * Va en el panel (`app/admin/layout.tsx`) y en el editor: sin esto, las etiquetas saldrían
 * sin fondo (los botones no: `button.tsx` lleva el de fábrica de respaldo).
 *
 * `coloresDe` y `coloresDeBoton` solo dejan pasar `#rrggbb` y si no, el de fábrica: lo que
 * se escribe aquí nunca es texto libre, ni aunque la API devolviera otra cosa.
 */
export function EstilosDeIdentidad({ identidad }: { identidad: IdentidadPanel }) {
  const acciones = ACCIONES_DEL_PANEL.map(({ id }) => {
    const { fondo, texto } = coloresDe(identidad, id);
    return `--olo-accion-${id}-fondo:${fondo};--olo-accion-${id}-texto:${texto};`;
  });
  const botones = BOTONES_DEL_PANEL.map(({ id }) => {
    const { fondo, texto } = coloresDeBoton(identidad, id);
    return `--olo-boton-${id}-fondo:${fondo};--olo-boton-${id}-texto:${texto};`;
  });

  return <style>{`:root{${[...acciones, ...botones].join('')}}`}</style>;
}

/**
 * El icono de la pestaña en el panel y en el editor. `icons` de un layout reemplaza entero
 * el de `app/layout.tsx`, así que el de Apple se repite aquí para no perderlo.
 */
export async function metadataDeIdentidad(): Promise<Metadata> {
  const identidad = await obtenerIdentidadPanel();
  return { icons: { icon: iconoDelPanel(identidad), apple: ICONO_APPLE } };
}
