'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ContextoDeEdicion } from '@/config/puck.config';
import {
  PuckEditorWrapper,
  AvisoEditorOcupado,
  rutaPublicaDeSlug,
  usePagina,
  useBloqueoDeEdicion,
  type Pagina,
  type Plantilla,
} from '@/features/paginas';
import { GooLoader } from '@/shared/ui/atoms/goo-loader';

// Tiempo mínimo del loader para que la animación se complete antes de mostrar el editor.
// Debe coincidir con el editor de la intranet.
const MIN_LOADER_MS = 8000;

/**
 * La parte de cliente del editor.
 *
 * Se separó de `page.tsx` para que la comprobación de permisos ocurra en el
 * servidor: antes toda la pantalla era `'use client'` y cualquiera con la URL
 * recibía el editor entero en el navegador, aunque luego no pudiera guardar.
 */
interface EditorClientProps {
  slug: string;
  /** Cabecera/pie publicados, para mostrarlos bloqueados alrededor de una sección. */
  plantilla?: Plantilla | null;
  /** La página de la que venía quien edita, para mostrarla bloqueada bajo la plantilla. */
  paginaDeReferencia?: Pagina | null;
}

export function EditorClient({ slug, plantilla, paginaDeReferencia }: EditorClientProps) {
  // `rechazo` viene del hook y no se deriva de `estado`: guardar un borrador cambia el
  // estado a 'borrador' —eso es justo lo que vuelve a habilitar «Enviar a revisión»—,
  // y el aviso tiene que sobrevivir a ese guardado para que se pueda leer mientras se
  // corrige. Al venir de un `useState` su identidad ya es estable entre renders, que es
  // lo que `overrides` de Puck necesita para no reconstruir su store en cada uno.
  const { pagina, rechazo, isLoading, error, setError, saveDraft, submitForReview } = usePagina(slug);

  // Se pide antes que nada: si la página la tiene otra persona, no tiene sentido
  // ni cargar su contenido.
  const bloqueo = useBloqueoDeEdicion(slug);

  const estado = pagina?.estado ?? null;

  // Identidad estable: si este objeto cambia, Puck reconstruye su store y el
  // editor se reinicia con lo que se llevara sin guardar.
  const contexto = useMemo<ContextoDeEdicion>(
    () => ({
      plantilla: plantilla ?? null,
      seccion: paginaDeReferencia
        ? { slug: paginaDeReferencia.slug, contenido: paginaDeReferencia.contenido }
        : null,
    }),
    [plantilla, paginaDeReferencia]
  );

  // Mantiene el loader visible al menos MIN_LOADER_MS aunque los datos carguen antes.
  const [minTimePassed, setMinTimePassed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  // La tiene otra persona: se corta aquí, antes de montar nada del editor.
  if (bloqueo.estado === 'ajeno') {
    return (
      <AvisoEditorOcupado
        nombre={bloqueo.bloqueadoPor ?? 'Otra persona'}
        puedeForzar={bloqueo.puedeForzar}
        onReintentar={bloqueo.reintentar}
        rutaDeVuelta={rutaPublicaDeSlug(slug)}
      />
    );
  }

  if (isLoading || !minTimePassed || bloqueo.estado === 'pidiendo') {
    return (
      <div className="editor-loading-overlay">
        <GooLoader label="Cargando editor..." />
      </div>
    );
  }

  if (error && !pagina) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {error && pagina && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 99999,
            backgroundColor: '#fee4e2',
            color: '#b42318',
            border: '1px solid #fda29b',
            // 16, como todos los mensajes de estado del panel.
            borderRadius: 16,
            padding: '10px 16px',
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(16, 24, 40, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: '90vw',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#b42318',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 14,
            }}
            aria-label="Cerrar aviso de error"
          >
            ✕
          </button>
        </div>
      )}
      <PuckEditorWrapper
        slug={slug}
        initialData={pagina?.contenido}
        onSave={saveDraft}
        onPublish={submitForReview}
        rutaPorDefecto={rutaPublicaDeSlug(slug)}
        estado={estado}
        rechazo={rechazo}
        contexto={contexto}
        // Solo importa el caso «nos lo quitaron»: los otros ya se resolvieron arriba.
        candadoPerdidoPor={bloqueo.estado === 'perdido' ? bloqueo.bloqueadoPor : null}
      />
    </>
  );
}
