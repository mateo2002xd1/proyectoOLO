'use client';

import { use, useState, useEffect } from 'react';
import { PuckEditorWrapper } from '@/features/paginas/components/puck-editor-wrapper';
import { rutaPublicaDeSlug } from '@/features/paginas/lib/ruta-de-vuelta';
import { usePagina } from '@/features/paginas/hooks/use-pagina';
import { GooLoader } from '@/shared/ui/atoms/GooLoader';

// Tiempo mínimo del loader para que la animación se complete antes de mostrar el editor.
const MIN_LOADER_MS = 8000;

export default function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { pagina, isLoading, error, saveDraft, submitForReview } = usePagina(slug);

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
      initialData={pagina?.contenido}
      onSave={saveDraft}
      onPublish={submitForReview}
      rutaPorDefecto={rutaPublicaDeSlug(slug)}
    />
  );
}
