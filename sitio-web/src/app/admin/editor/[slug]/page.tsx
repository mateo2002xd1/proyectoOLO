'use client';

import { use } from 'react';
import { PuckEditorWrapper } from '@/features/paginas/components/puck-editor-wrapper';
import { usePagina } from '@/features/paginas/hooks/use-pagina';

export default function EditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { pagina, isLoading, error, saveDraft, submitForReview } = usePagina(slug);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando editor...</p>
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
    />
  );
}
