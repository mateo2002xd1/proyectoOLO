'use client';

import { useEffect, useRef } from 'react';
import type EditorJSInstance from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';

interface EditorjsWrapperProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
}

export function EditorjsWrapper({ data, onChange, readOnly = false }: EditorjsWrapperProps) {
  const editorRef = useRef<EditorJSInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // El editor se monta una sola vez, pero `onChange` puede cambiar de identidad
  // en cada render del padre. Lo guardamos en un ref para que el callback del
  // editor siempre llame a la versión actual y no a la capturada al montar.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let editorInstance: EditorJSInstance | null = null;

    const initEditor = async () => {
      if (!containerRef.current) return;

      try {
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Paragraph = (await import('@editorjs/paragraph')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Quote = (await import('@editorjs/quote')).default;

        editorInstance = new EditorJS({
          holder: containerRef.current,
          data: data || { blocks: [] },
          readOnly,
          tools: {
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
            header: {
              class: Header,
              inlineToolbar: true,
              config: {
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
              },
            },
            list: {
              class: List,
              inlineToolbar: true,
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
            },
          },
          onChange: async () => {
            if (onChangeRef.current && editorRef.current) {
              try {
                const outputData = await editorRef.current.save();
                onChangeRef.current(outputData);
              } catch (err) {
                console.error('Error saving editor:', err);
              }
            }
          },
        });

        editorRef.current = editorInstance;
      } catch (error) {
        console.error('Failed to initialize EditorJS', error);
      }
    };

    initEditor();

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
        editorRef.current = null;
      }
    };
    // Deliberadamente sin dependencias: el editor debe instanciarse una sola vez.
    // Reinicializarlo al cambiar `data` o `readOnly` destruiría lo que el usuario
    // esté escribiendo. `onChange` se lee desde onChangeRef, así que no queda obsoleto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        background: 'white',
        minHeight: 200,
      }}
    />
  );
}
