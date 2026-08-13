'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Puck, createUsePuck, Data } from '@puckeditor/core';
import '@puckeditor/core/dist/index.css';
import { puckConfig } from '@/config/puck.config';
import { resolverRutaDeVuelta } from '../lib/ruta-de-vuelta';
import { Bloque, PuckData } from '../types';
import { AvisoRechazo, type Rechazo } from './aviso-rechazo';


interface PuckEditorWrapperProps {
  initialData?: PuckData | Bloque[];
  onSave: (contenido: PuckData) => Promise<unknown>;
  onPublish?: () => Promise<unknown>;
  /** A dónde vuelve "Salir" si no llegó un `?volver=` en la URL. */
  rutaPorDefecto: string;
  /** Presente solo si la versión que se está editando fue rechazada. */
  rechazo?: Rechazo;
}

/** Con selector, para no re-renderizar la cabecera ante cualquier cambio del editor. */
const usePuckSel = createUsePuck();

interface AccionesCabeceraProps {
  busy: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  puedeEnviar: boolean;
  /** Punto de la historia de Puck en el que se guardó por última vez. */
  indiceGuardado: number;
  /** Reciben el índice actual para poder marcar hasta dónde quedó guardado. */
  onGuardar: (indiceHistoria: number) => void;
  onEnviar: (indiceHistoria: number) => void;
  onSalir: (hayCambiosSinGuardar: boolean) => void;
}

/**
 * Acciones de la cabecera del editor.
 *
 * Vive dentro del árbol de Puck para poder leer su historia, que es la señal
 * fiable de "aquí se ha tocado algo": cada acción deshacible avanza el índice.
 * Comparar el JSON contra el contenido inicial no vale — Puck no emite `onChange`
 * al montar, así que el primer cambio de verdad se confundía con la línea base y
 * salir descartaba trabajo sin avisar.
 */
function AccionesCabecera({
  busy,
  isSaving,
  isSubmitting,
  puedeEnviar,
  indiceGuardado,
  onGuardar,
  onEnviar,
  onSalir,
}: AccionesCabeceraProps) {
  const indiceHistoria = usePuckSel((s) => s.history.index);
  // Deshacer hasta el punto guardado vuelve a dejarlo limpio, y eso es correcto.
  const hayCambiosSinGuardar = indiceHistoria !== indiceGuardado;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {hayCambiosSinGuardar && (
        <span style={{ fontSize: 12, color: '#d97706' }}>Sin guardar</span>
      )}
      {/* Salir no es una acción sobre el contenido: se deja en gris para que no
          compita con guardar y enviar. */}
      <button
        type="button"
        onClick={() => onSalir(hayCambiosSinGuardar)}
        disabled={busy}
        title="Volver a la página sin publicar nada"
        style={{
          padding: '7px 16px',
          background: 'transparent',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          cursor: busy ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          fontSize: 14,
        }}
      >
        Salir
      </button>
      <button
        type="button"
        onClick={() => onGuardar(indiceHistoria)}
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
      {puedeEnviar && (
        <button
          type="button"
          onClick={() => onEnviar(indiceHistoria)}
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
  );
}

export function PuckEditorWrapper({
  initialData,
  onSave,
  onPublish,
  rutaPorDefecto,
  rechazo,
}: PuckEditorWrapperProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snapshot del layout actual de Puck — actualizado por onChange
  const currentDataRef = useRef<Data | null>(null);

  // La historia arranca en 0; tras cada guardado exitoso se mueve al punto actual.
  const [indiceGuardado, setIndiceGuardado] = useState(0);

  // Datos iniciales con identidad estable (evita re-render infinito en Puck).
  // Va en useState con inicializador diferido, no en useRef: los refs no deben
  // leerse durante el render, y así el objeto se construye una sola vez.
  const [initialPuckData] = useState<Data>(() =>
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

  const handleSaveDraft = useCallback(
    async (indiceHistoria: number) => {
      // El contenido se toma antes del await, así que corresponde al índice del
      // clic: si alguien sigue editando mientras se guarda, esos cambios quedan
      // fuera y deben seguir contando como pendientes.
      const data = currentDataRef.current ?? initialPuckData;
      setIsSaving(true);
      try {
        await onSave(data as PuckData);
        // Solo se llega aquí si la API aceptó el borrador.
        setIndiceGuardado(indiceHistoria);
      } finally {
        setIsSaving(false);
      }
    },
    [onSave, initialPuckData]
  );

  const handleSubmitForReview = useCallback(
    async (indiceHistoria: number) => {
      if (!onPublish) return;
      setIsSubmitting(true);
      try {
        // Guardar antes de enviar a revisión (regla: contenido siempre consistente).
        // Si el guardado falla no se envía nada: quedaría pendiente la versión vieja.
        await handleSaveDraft(indiceHistoria);
        await onPublish();
      } finally {
        setIsSubmitting(false);
      }
    },
    [onPublish, handleSaveDraft]
  );

  const busy = isSaving || isSubmitting;

  /** Vuelve a la ruta desde la que se abrió el editor. */
  const handleSalir = useCallback(
    (hayCambiosSinGuardar: boolean) => {
      if (
        hayCambiosSinGuardar &&
        !window.confirm(
          'Hay cambios sin guardar.\n\nSi sales ahora se pierden. ¿Salir de todos modos?',
        )
      ) {
        return;
      }
      router.push(resolverRutaDeVuelta(rutaPorDefecto));
    },
    [router, rutaPorDefecto]
  );

  // Un onClick no puede devolver una promesa rechazada; el error de guardado lo
  // recoge `usePagina` y lo muestra la página del editor.
  const alPulsarGuardar = useCallback(
    (indiceHistoria: number) => {
      void handleSaveDraft(indiceHistoria).catch(() => undefined);
    },
    [handleSaveDraft]
  );

  const alPulsarEnviar = useCallback(
    (indiceHistoria: number) => {
      void handleSubmitForReview(indiceHistoria).catch(() => undefined);
    },
    [handleSubmitForReview]
  );

  // Memorizado porque Puck reconstruye su store cada vez que cambia la identidad
  // de `overrides`.
  const overrides = useMemo(
    () => ({
      headerActions: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Antes que las acciones: se lee el porqué antes de volver a tocar nada. */}
          {rechazo && <AvisoRechazo {...rechazo} />}
          <AccionesCabecera
            busy={busy}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            puedeEnviar={!!onPublish}
            indiceGuardado={indiceGuardado}
            onGuardar={alPulsarGuardar}
            onEnviar={alPulsarEnviar}
            onSalir={handleSalir}
          />
        </div>
      ),
    }),
    [
      busy,
      isSaving,
      isSubmitting,
      onPublish,
      indiceGuardado,
      alPulsarGuardar,
      alPulsarEnviar,
      handleSalir,
      rechazo,
    ]
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 9999 }}>
      <Puck
        config={puckConfig}
        data={initialPuckData}
        onChange={handleChange}
        // El botón "Publish" de serie no llega a dibujarse: `headerActions` lo
        // sustituye por Salir / Guardar / Enviar. `onPublish` queda como no-op.
        onPublish={() => undefined}
        overrides={overrides}
      />
    </div>
  );
}
