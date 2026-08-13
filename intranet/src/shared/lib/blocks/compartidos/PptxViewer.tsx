"use client";

import React, { useEffect, useRef, useState } from 'react';
import { PptxViewer as AidenPptxViewer } from '@aiden0z/pptx-renderer';

interface PptxViewerProps {
  fileUrl: string;
}

export function PptxViewer({ fileUrl }: PptxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let viewer: AidenPptxViewer | null = null;

    const loadPptx = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(fileUrl);

        const contentType = resp.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(`El archivo no se encontró en la ruta ${fileUrl}. El servidor devolvió una página HTML en lugar del archivo PPTX.`);
        }

        if (!resp.ok) {
          throw new Error("Failed to fetch PPTX file");
        }

        const data = await resp.arrayBuffer();

        container.innerHTML = ''; // Limpiar si había algo previo

        viewer = await AidenPptxViewer.open(data, container);
      } catch (err: any) {
        console.error("Error loading PPTX:", err);
        setError(err.message || "Error al cargar la presentación");
      } finally {
        setLoading(false);
      }
    };

    loadPptx();

    return () => {
      // Limpieza de recursos
      if (viewer && typeof (viewer as any).destroy === 'function') {
        (viewer as any).destroy();
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [fileUrl]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(243, 244, 246, 0.5)' }}>
          <p style={{ color: '#4b5563', fontWeight: 500 }}>Cargando presentación...</p>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>{error}</p>
        </div>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      />
    </div>
  );
}
