'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { codigoDeError, estadoHttp, mensajeDeErrorApi } from '@/shared/lib/errores-api';
import type { RegistroRespaldo } from '../types';
import { restaurarRespaldo, verificarBloqueo } from '../services/respaldos.service';
import { ModalConfirmarRestauracion } from './modal-confirmar-restauracion';
import { ModalBloqueoRestauracion } from './modal-bloqueo-restauracion';

const URL_INTRANET = process.env.NEXT_PUBLIC_INTRANET_URL || 'http://localhost:3001';

function enlaceDeVistaPrevia(registro: RegistroRespaldo): string {
  const paramVersion = registro.versionAnteriorId ? `?versionId=${registro.versionAnteriorId}` : '';
  return registro.ambito === 'intranet'
    ? `${URL_INTRANET}/preview/${registro.slug}${paramVersion}`
    : `/admin/preview/${registro.slug}${paramVersion}`;
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm break-words text-zinc-900 dark:text-[#f6f6f6]">{children}</dd>
    </div>
  );
}

/**
 * Modal de consulta de la versión anterior archivada (respaldo).
 *
 * Permite previsualizar cómo era la página antes de ser reemplazada
 * (con el mismo visor Puck que la cola de revisión) y restaurarla
 * atómicamente a producción.
 */
export function VistaPreviaVersion({
  registro,
  onCerrar,
  onRestaurado,
}: {
  registro: RegistroRespaldo | null;
  onCerrar: () => void;
  onRestaurado?: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [restaurando, setRestaurando] = useState(false);
  const [errorRestaurar, setErrorRestaurar] = useState<string | null>(null);
  const [exitoRestaurar, setExitoRestaurar] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarBloqueo, setMostrarBloqueo] = useState(false);
  const [errorBloqueo, setErrorBloqueo] = useState<string | null>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    const debeEstarAbierto = !!registro && !mostrarConfirmacion && !mostrarBloqueo;
    
    if (debeEstarAbierto && !el.open) el.showModal();
    if (!debeEstarAbierto && el.open) el.close();
  }, [registro, mostrarConfirmacion, mostrarBloqueo]);

  useEffect(() => {
    setErrorRestaurar(null);
    setExitoRestaurar(false);
    setRestaurando(false);
  }, [registro]);

  async function handleIntentarRestaurar() {
    if (!registro) return;
    
    setRestaurando(true);
    try {
      const { bloqueadoPor } = await verificarBloqueo(registro.slug, registro.ambito);
      if (bloqueadoPor) {
        setErrorBloqueo(`No se puede restaurar la página porque está siendo editada por ${bloqueadoPor.usuario_nombre}`);
        setMostrarBloqueo(true);
      } else {
        setMostrarConfirmacion(true);
      }
    } catch (err) {
      console.error('Error al verificar el bloqueo', err);
      // Fallback a mostrar la confirmación si la verificación falla
      setMostrarConfirmacion(true);
    } finally {
      setRestaurando(false);
    }
  }

  async function handleRestaurarConfirmado() {
    if (!registro) return;
    setMostrarConfirmacion(false);

    setRestaurando(true);
    setErrorRestaurar(null);
    try {
      await restaurarRespaldo(registro.slug, registro.ambito, {
        versionId: registro.versionAnteriorId,
        numeroVersion: registro.versionAnteriorNumero,
      });
      setExitoRestaurar(true);
      setTimeout(() => {
        onRestaurado?.();
        onCerrar();
      }, 1200);
    } catch (err) {
      // El backend seguirá protegiendo la acción por si el candado se adquiere
      // entre el click al botón verde y la confirmación final.
      if (estadoHttp(err) === 409 && codigoDeError(err) === 'PAGE_LOCKED') {
        setErrorBloqueo(mensajeDeErrorApi(err, 'La página está siendo editada por otra persona.'));
        setMostrarBloqueo(true);
      } else {
        setErrorRestaurar(mensajeDeErrorApi(err, 'Error al restaurar la versión anterior.'));
      }
    } finally {
      setRestaurando(false);
    }
  }

  return (
    <>
      <dialog
        ref={dialogo}
        onClose={() => {
          if (!mostrarConfirmacion && !mostrarBloqueo) {
            onCerrar();
          }
        }}
        // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto
        // dentro del diálogo y suelta el ratón fuera, el clic se contabiliza en
        // el fondo y el diálogo se cerraba en mitad de la selección.
        onMouseDown={(e) => {
          if (e.target === dialogo.current && !restaurando) {
            if (!mostrarConfirmacion && !mostrarBloqueo) onCerrar();
          }
        }}
        className="m-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-[#0f172a]/50 backdrop:backdrop-blur-sm dark:border-[#7db828]/30 dark:bg-[#131b2f] dark:text-[#f6f6f6]"
      >
        {registro && (
          <div className="flex max-h-[80vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-700">
            <div>
              <h2 className="admin-subtitle">Versión anterior de {registro.titulo}</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                /{registro.slug} · versión {registro.versionAnteriorNumero}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              disabled={restaurando}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-y-auto p-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Dato etiqueta="Reemplazada por la versión">{registro.numeroVersion}</Dato>
              <Dato etiqueta="Reemplazada el">
                {new Date(registro.publicadoEn).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'medium' })}
              </Dato>
              <Dato etiqueta="Editada por">{registro.editadoPor.nombre}</Dato>
              <Dato etiqueta="Publicada por">{registro.publicadoPor.nombre}</Dato>
            </dl>

            {errorRestaurar && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{errorRestaurar}</p>
              </div>
            )}

            {exitoRestaurar && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p>¡Versión {registro.versionAnteriorNumero} restaurada con éxito! La página ha sido publicada nuevamente.</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={enlaceDeVistaPrevia(registro)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-[#002237]/40 hover:bg-[#002237]/5 hover:text-[#002237] dark:border-zinc-600 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Ver vista previa
              </a>
              <button
                type="button"
                onClick={handleIntentarRestaurar}
                disabled={restaurando || exitoRestaurar}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-interactive px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-interactive-hover disabled:opacity-60"
              >
                <RotateCcw className={`h-4 w-4 ${restaurando ? 'animate-spin' : ''}`} />
                {restaurando ? 'Restaurando…' : exitoRestaurar ? '¡Restaurada!' : 'Restaurar versión'}
              </button>
            </div>
            </div>
          </div>
        )}
      </dialog>

      {registro && (
        <ModalConfirmarRestauracion
          abierto={mostrarConfirmacion}
          versionAnteriorNumero={registro.versionAnteriorNumero}
          slug={registro.slug}
          numeroVersionActual={registro.numeroVersion}
          onConfirmar={handleRestaurarConfirmado}
          onCancelar={() => setMostrarConfirmacion(false)}
        />
      )}

      <ModalBloqueoRestauracion
        abierto={mostrarBloqueo}
        mensajeBloqueo={errorBloqueo}
        onCerrar={() => setMostrarBloqueo(false)}
      />
    </>
  );
}
