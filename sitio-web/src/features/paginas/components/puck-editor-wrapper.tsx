'use client';

import { useState, useCallback, useRef } from 'react';
import { Puck, Data } from '@puckeditor/core';
import '@puckeditor/core/dist/index.css';
import { puckConfig } from '@/config/puck.config';
import { Bloque, PuckData } from '../types';


interface PuckEditorWrapperProps {
  initialData?: PuckData | Bloque[];
  onSave: (contenido: PuckData) => Promise<any>;
  onPublish?: () => Promise<any>;
}

export function PuckEditorWrapper({
  initialData,
  onSave,
  onPublish,
}: PuckEditorWrapperProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snapshot del layout actual de Puck — actualizado por onChange
  const currentDataRef = useRef<Data | null>(null);

  // Ref estable para los datos iniciales (evita re-render infinito)
  const initialPuckDataRef = useRef<Data>(
    Array.isArray(initialData)
      ? {
          content: initialData.map((bloque) => ({
            type: bloque.type,
            props: bloque.props,
          })),
          root: {},
        }
      : (initialData as Data) ?? { content: [], root: {} }
  );

  const handleChange = useCallback((data: Data) => {
    currentDataRef.current = data;
  }, []);

  const handleSaveDraft = useCallback(async () => {
    const data = currentDataRef.current ?? initialPuckDataRef.current;
    setIsSaving(true);
    try {
      await onSave(data as PuckData);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleSubmitForReview = useCallback(async () => {
    if (!onPublish) return;
    setIsSubmitting(true);
    try {
      // Guardar antes de enviar a revisión (regla: contenido siempre consistente)
      await handleSaveDraft();
      await onPublish();
    } finally {
      setIsSubmitting(false);
    }
  }, [onPublish, handleSaveDraft]);

  const busy = isSaving || isSubmitting;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 9999 }}>
      <Puck
        config={puckConfig}
        data={initialPuckDataRef.current}
        onChange={handleChange}
        onPublish={handleSaveDraft}
        overrides={{
          headerActions: () => (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSaveDraft}
                disabled={busy}
                style={{
                  padding: '7px 16px',
                  background: busy ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {isSaving ? 'Guardando…' : 'Guardar Borrador'}
              </button>
              {onPublish && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={busy}
                  style={{
                    padding: '7px 16px',
                    background: busy ? '#6ee7b7' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {isSubmitting ? 'Enviando…' : 'Enviar a Revisión'}
                </button>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
}
