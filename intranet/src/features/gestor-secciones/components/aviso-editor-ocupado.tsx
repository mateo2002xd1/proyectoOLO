/**
 * Lo que ve quien intenta abrir una sección que otra persona ya está editando.
 *
 * Ocupa la pantalla entera a propósito: no es un aviso al margen de un editor que
 * igualmente funciona, es el motivo por el que el editor no se abre. Dejar el editor
 * detrás invitaría a intentarlo igual.
 *
 * «Entrar de todos modos» solo aparece para Superadmin y Administrador —lo decide la
 * API, no este componente— y le quita el candado a quien lo tenga. Es la salida para
 * cuando alguien se dejó una pestaña abierta y se fue.
 */
"use client";

import { useRouter } from "next/navigation";

interface AvisoEditorOcupadoProps {
  /** Quién tiene la sección abierta. */
  nombre: string;
  /** Si a esta persona se le ofrece quitarle el candado. */
  puedeForzar: boolean;
  onReintentar: (forzar?: boolean) => void;
  /** A dónde vuelve el botón de salir. */
  rutaDeVuelta: string;
}

export function AvisoEditorOcupado({
  nombre,
  puedeForzar,
  onReintentar,
  rutaDeVuelta,
}: AvisoEditorOcupadoProps) {
  const router = useRouter();

  return (
    <div className="olo-ocupado" role="alert">
      <div className="olo-ocupado-caja">
        <div className="olo-ocupado-icono-wrapper">
          <svg
            viewBox="0 0 24 24"
            width={40}
            height={40}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="olo-ocupado-icono"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="olo-ocupado-contenido">
          <h1 className="olo-ocupado-titulo">Esta sección está siendo editada por {nombre}</h1>
          <div className="olo-ocupado-acciones">
            <button
              type="button"
              className="olo-editor-btn olo-editor-btn--salir"
              onClick={() => router.push(rutaDeVuelta)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <button
              type="button"
              className="olo-editor-btn olo-editor-btn--guardar"
              onClick={() => onReintentar(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reintentar
            </button>
            {puedeForzar && (
              <button
                type="button"
                className="olo-editor-btn olo-editor-btn--enviar"
                title="Le quita el candado a quien lo tenga. Sus cambios sin guardar se perderán."
                onClick={() => onReintentar(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                  <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
                Entrar de todos modos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
