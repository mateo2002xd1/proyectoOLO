'use client';

import { useState, useEffect, useMemo } from 'react';
import { PuckEditorWrapper } from '@/features/paginas/components/puck-editor-wrapper';
import { rutaPublicaDeSlug } from '@/features/paginas/lib/ruta-de-vuelta';
import { usePagina } from '@/features/paginas/hooks/use-pagina';
import { GooLoader } from '@/shared/ui/atoms/GooLoader';

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
export function EditorClient({ slug }: { slug: string }) {
  const { pagina, isLoading, error, saveDraft, submitForReview } = usePagina(slug);

  // Identidad estable: `overrides` de Puck depende de esto, y un objeto nuevo en
  // cada render le haría reconstruir su store. Se memoriza sobre los valores
  // sueltos —y no sobre `pagina`— para que guardar un borrador no lo recree.
  const estado = pagina?.estado ?? null;
  const motivo = pagina?.motivoRechazo ?? null;
  const numeroVersion = pagina?.numeroVersion ?? null;
  const rechazo = useMemo(
    () => (estado === 'rechazado' ? { motivo, numeroVersion } : undefined),
    [estado, motivo, numeroVersion],
  );

  // Mantiene el loader visible al menos MIN_LOADER_MS aunque los datos carguen antes.
  const [minTimePassed, setMinTimePassed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  if (isLoading || !minTimePassed) {
    return (
      <div className="editor-loading-overlay">
        <GooLoader label="Cargando editor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <PuckEditorWrapper
      slug={slug}
      initialData={pagina?.contenido}
      onSave={saveDraft}
      onPublish={submitForReview}
      rutaPorDefecto={rutaPublicaDeSlug(slug)}
      estado={estado}
      rechazo={rechazo}
    />
  );
}
