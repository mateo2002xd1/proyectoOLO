'use client';

import { useEffect, useRef } from 'react';

interface EditorjsWrapperProps {
  data?: any;
  onChange?: (data: any) => void;
  readOnly?: boolean;
}

export function EditorjsWrapper({ data, onChange, readOnly = false }: EditorjsWrapperProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let editorInstance: any = null;

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
            if (onChange && editorRef.current) {
              try {
                const outputData = await editorRef.current.save();
                onChange(outputData);
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
