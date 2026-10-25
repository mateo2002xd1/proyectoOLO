'use client';

import { useEffect, useRef } from 'react';
import type EditorJSInstance from '@editorjs/editorjs';
import type { OutputData, OutputBlockData } from '@editorjs/editorjs';

interface EditorjsWrapperProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  /** Color de todo el texto (#rrggbb); sin él, los grises de siempre. Solo en modo lectura. */
  colorTexto?: string;
}

type ItemLista = string | { content?: string; items?: ItemLista[] };

function renderizarItemsLista(items: ItemLista[], estilo: string) {
  if (!Array.isArray(items)) return null;
  return items.map((item, idx) => {
    const esCadena = typeof item === 'string';
    const texto = esCadena ? item : item?.content || '';
    const subItems = !esCadena && Array.isArray(item?.items) && item.items.length > 0 ? item.items : null;
    return (
      <li key={idx} className="leading-relaxed">
        <span dangerouslySetInnerHTML={{ __html: texto }} />
        {subItems && (
          estilo === 'ordered' ? (
            <ol className="list-decimal pl-6 mt-1 space-y-1">{renderizarItemsLista(subItems, estilo)}</ol>
          ) : (
            <ul className="list-disc pl-6 mt-1 space-y-1">{renderizarItemsLista(subItems, estilo)}</ul>
          )
        )}
      </li>
    );
  });
}

function renderizarBloque(bloque: OutputBlockData, index: number, colorTexto?: string) {
  const clave = bloque.id || index;
  // Cada tipo de bloque trae su color por clase de Tailwind, así que el color elegido va en línea:
  // gana a la clase y no hace falta CSS en cada app.
  const estiloColor = colorTexto ? { color: colorTexto } : undefined;
  switch (bloque.type) {
    case 'header': {
      const nivel = Math.min(Math.max(bloque.data?.level || 2, 1), 6);
      const Tag = `h${nivel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const clasesNivel: Record<number, string> = {
        1: 'text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mt-8 mb-4',
        2: 'text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white mt-6 mb-3',
        3: 'text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white mt-5 mb-2.5',
        4: 'text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2',
        5: 'text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5',
        6: 'text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mt-3 mb-1.5',
      };
      return (
        <Tag
          key={clave}
          className={clasesNivel[nivel] ?? clasesNivel[2]}
          style={estiloColor}
          dangerouslySetInnerHTML={{ __html: bloque.data?.text || '' }}
        />
      );
    }
    case 'paragraph': {
      return (
        <p
          key={clave}
          className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300 mb-4 last:mb-0"
          style={estiloColor}
          dangerouslySetInnerHTML={{ __html: bloque.data?.text || '' }}
        />
      );
    }
    case 'list': {
      const esOrdenada = bloque.data?.style === 'ordered';
      const ListTag = esOrdenada ? 'ol' : 'ul';
      const claseLista = esOrdenada
        ? 'list-decimal pl-6 mb-4 space-y-1 text-zinc-700 dark:text-zinc-300'
        : 'list-disc pl-6 mb-4 space-y-1 text-zinc-700 dark:text-zinc-300';

      return (
        <ListTag key={clave} className={claseLista} style={estiloColor}>
          {renderizarItemsLista(bloque.data?.items || [], esOrdenada ? 'ordered' : 'unordered')}
        </ListTag>
      );
    }
    case 'quote': {
      return (
        <blockquote
          key={clave}
          className={`my-4 border-l-4 border-[#4C7A1C] pl-4 py-2 italic text-zinc-700 dark:text-zinc-300 bg-zinc-50/80 dark:bg-zinc-800/40 rounded-r ${
            bloque.data?.alignment === 'center' ? 'text-center' : 'text-left'
          }`}
          style={estiloColor}
        >
          <div dangerouslySetInnerHTML={{ __html: bloque.data?.text || '' }} />
          {bloque.data?.caption && (
            <cite className="block text-xs font-normal not-italic text-zinc-500 dark:text-zinc-400 mt-1.5">
              — {bloque.data.caption}
            </cite>
          )}
        </blockquote>
      );
    }
    case 'image': {
      const src = bloque.data?.file?.url || bloque.data?.url;
      if (!src) return null;
      return (
        <figure key={clave} className="my-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={bloque.data?.caption || ''}
            className={`mx-auto rounded-lg shadow-xs ${
              bloque.data?.stretched ? 'w-full' : 'max-w-full'
            } ${bloque.data?.withBorder ? 'border border-zinc-200 dark:border-zinc-700' : ''}`}
          />
          {bloque.data?.caption && (
            <figcaption className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              {bloque.data.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case 'delimiter': {
      return <hr key={clave} className="my-6 border-zinc-200 dark:border-zinc-700" />;
    }
    default: {
      if (bloque.data?.text) {
        return (
          <div
            key={clave}
            className="mb-4 text-zinc-700 dark:text-zinc-300"
            style={estiloColor}
            dangerouslySetInnerHTML={{ __html: bloque.data.text }}
          />
        );
      }
      return null;
    }
  }
}

function tieneContenido(data?: OutputData): boolean {
  if (!data?.blocks || data.blocks.length === 0) return false;
  return data.blocks.some((b) => {
    if (b.type === 'paragraph' || b.type === 'header') {
      return Boolean(b.data?.text && b.data.text.trim().length > 0);
    }
    if (b.type === 'list') {
      return Array.isArray(b.data?.items) && b.data.items.length > 0;
    }
    if (b.type === 'quote') {
      return Boolean(b.data?.text && b.data.text.trim().length > 0);
    }
    if (b.type === 'image') {
      return Boolean(b.data?.file?.url || b.data?.url);
    }
    return true;
  });
}

const COLOR_VALIDO = /^#[0-9a-fA-F]{3,8}$/;

export function EditorjsWrapper({ data, onChange, readOnly = false, colorTexto }: EditorjsWrapperProps) {
  const editorRef = useRef<EditorJSInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ultimoObjetoEmitidoRef = useRef<OutputData | null>(null);
  const ultimoJsonEmitidoRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const dataInicialRef = useRef(data);

  // Modo edición (en el panel lateral de propiedades de Puck)
  useEffect(() => {
    if (readOnly) return;
    let editorInstance: EditorJSInstance | null = null;
    // La carga de Editor.js es asíncrona: si el efecto se limpia antes de que termine (React
    // vuelve a montar el componente, p. ej. el modo estricto en desarrollo o un cambio de
    // lugar en el panel), la carga vieja seguía y creaba un segundo editor dentro del mismo
    // contenedor, que se veía duplicado. `cancelado` la corta.
    let cancelado = false;
    const container = containerRef.current;
    if (!container) return;

    const guardarInmediato = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        if (!editorRef.current || !onChangeRef.current) return;
        try {
          const outputData = await editorRef.current.save();
          ultimoObjetoEmitidoRef.current = outputData;
          ultimoJsonEmitidoRef.current = JSON.stringify(outputData.blocks || []);
          onChangeRef.current(outputData);
        } catch (err) {
          console.error('Error guardando editor:', err);
        }
      }, 35);
    };

    const initEditor = async () => {
      try {
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Paragraph = (await import('@editorjs/paragraph')).default;
        const Header = (await import('@editorjs/header')).default;
        const List = (await import('@editorjs/list')).default;
        const Quote = (await import('@editorjs/quote')).default;

        if (cancelado) return;
        // Por si una instancia anterior dejó su marcado en el contenedor.
        container.innerHTML = '';

        editorInstance = new EditorJS({
          holder: container,
          data: dataInicialRef.current || { blocks: [] },
          readOnly: false,
          minHeight: 120,
          placeholder: 'Escribe aquí tu contenido...',
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
          onChange: () => {
            guardarInmediato();
          },
        });

        editorRef.current = editorInstance;
      } catch (error) {
        console.error('Failed to initialize EditorJS', error);
      }
    };

    initEditor();

    // Capturar cada pulsación de tecla inmediatamente en el DOM
    container.addEventListener('input', guardarInmediato, true);
    container.addEventListener('keyup', guardarInmediato, true);
    container.addEventListener('paste', guardarInmediato, true);
    container.addEventListener('cut', guardarInmediato, true);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      container.removeEventListener('input', guardarInmediato, true);
      container.removeEventListener('keyup', guardarInmediato, true);
      container.removeEventListener('paste', guardarInmediato, true);
      container.removeEventListener('cut', guardarInmediato, true);

      cancelado = true;
      const activo = editorInstance ?? editorRef.current;
      if (activo && typeof activo.destroy === 'function') {
        try {
          activo.destroy();
        } catch (e) {
          console.error(e);
        }
      }
      editorRef.current = null;
    };
    // El editor se inicializa una sola vez al montar; las actualizaciones posteriores
    // de data se sincronizan en el efecto inferior para no destruir el estado ni mover el cursor.
  }, [readOnly]);

  // Si data cambia externamente (ej. deshacer/rehacer en Puck) en modo edición
  useEffect(() => {
    if (readOnly) return;
    const editor = editorRef.current;
    if (!editor || typeof editor.render !== 'function') return;

    const datosNuevos = data || { blocks: [] };
    // Si la referencia del objeto coincide con la recién emitida, no hacer render redundante
    if (datosNuevos === ultimoObjetoEmitidoRef.current) return;

    const jsonNuevo = JSON.stringify(datosNuevos.blocks || []);
    if (jsonNuevo === ultimoJsonEmitidoRef.current) return;

    editor.isReady
      .then(() => {
        editor.render(datosNuevos).catch((e) => console.error('Error sincronizando EditorJS:', e));
      })
      .catch((e) => console.error(e));
  }, [data, readOnly]);

  // En modo lectura (lienzo de Puck o sitio web público):
  // Renderizar directamente los nodos en React para sincronización en tiempo real,
  // soporte SSR, tipografía coherente y evitar el marco gris de campo de texto.
  if (readOnly) {
    if (!tieneContenido(data)) {
      return (
        <div className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 p-8 text-center dark:border-zinc-700/80 dark:bg-zinc-800/30">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-zinc-200/70 dark:bg-zinc-700 text-[#4C7A1C] dark:text-[#7db828] mb-3">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Bloque de texto enriquecido</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Escribe o edita el contenido desde el panel lateral derecho.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full">
        {data!.blocks.map((bloque, index) =>
          renderizarBloque(bloque, index, colorTexto && COLOR_VALIDO.test(colorTexto.trim()) ? colorTexto.trim() : undefined)
        )}
      </div>
    );
  }

  // Panel lateral de edición
  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-zinc-900 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 [&_.ce-block__content]:max-w-none [&_.ce-toolbar__content]:max-w-none [&_.codex-editor__redactor]:!pb-8"
      style={{ minHeight: 180 }}
    />
  );
}
