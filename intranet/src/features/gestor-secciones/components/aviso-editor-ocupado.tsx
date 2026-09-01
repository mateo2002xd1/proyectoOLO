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

        <h1 className="olo-ocupado-titulo">Esta sección está siendo editada</h1>
        <p className="olo-ocupado-texto">
          <strong>{nombre}</strong> la tiene abierta ahora mismo. Para que no se pierda
          trabajo, solo una persona puede editarla a la vez.
        </p>
        <p className="olo-ocupado-apunte">
          Si acaba de cerrarla, se libera sola en un par de minutos: pulsa «Reintentar».
        </p>

        <div className="olo-ocupado-acciones">
          <button
            type="button"
            className="olo-editor-btn olo-editor-btn--salir"
            onClick={() => router.push(rutaDeVuelta)}
          >
            Volver
          </button>
          <button
            type="button"
            className="olo-editor-btn olo-editor-btn--guardar"
            onClick={() => onReintentar(false)}
          >
            Reintentar
          </button>
          {puedeForzar && (
            <button
              type="button"
              className="olo-editor-btn olo-editor-btn--enviar"
              title="Le quita el candado a quien lo tenga. Sus cambios sin guardar se perderán."
              onClick={() => onReintentar(true)}
            >
              Entrar de todos modos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
