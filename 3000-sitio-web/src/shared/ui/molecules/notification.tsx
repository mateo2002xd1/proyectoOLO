"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { reproducirSonidoAviso } from "@/shared/lib/sonido-avisos";
import { MensajeEstado, type TipoMensajeEstado } from "@/shared/ui/molecules/mensaje-estado";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

// Cada aviso es el mensaje de estado del proyecto (`MensajeEstado`) de su tipo: mismos
// colores e icono que las tarjetas del panel, del acceso y del editor.
const TIPO_DE_ESTADO: Record<NotificationType, TipoMensajeEstado> = {
  success: "exito",
  error: "error",
  warning: "advertencia",
  info: "info",
};

export function Notification({
  type,
  title,
  message,
  onClose,
  duration = 5000,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Suena con cada aviso nuevo, no con cada render: Roles y Usuarios le cambian el texto
  // sin desmontarlo si llega otro antes de que se cierre. Va en un `setTimeout` que se
  // cancela al desmontar para que el doble montaje del modo estricto no suene dos veces.
  // `info` no suena, y nada suena si se silenció en Configuración.
  useEffect(() => {
    const temporizador = setTimeout(() => reproducirSonidoAviso(type), 0);
    return () => clearTimeout(temporizador);
  }, [type, title, message]);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  function handleClose() {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    // Por debajo de `lg` el panel tiene la navegación mobile abajo: el aviso sale por encima.
    // Esquinas de 16 px, las de los mensajes de estado: la sombra va en la caja y tiene
    // que seguir las esquinas de `MensajeEstado`.
    <div className="fixed bottom-[calc(var(--navegacion-mobile-alto)+1.5rem)] right-6 z-[100] flex items-end justify-end pointer-events-none sm:right-8 lg:bottom-8">
      <div
        className={`pointer-events-auto w-[360px] max-w-[calc(100vw-3rem)] rounded-[16px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out ${
          isVisible && !isLeaving
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        {/* `alert` para lo que salió mal o pide atención; `status` para lo demás, que se
            anuncia sin interrumpir. */}
        <MensajeEstado
          tipo={TIPO_DE_ESTADO[type]}
          rol={type === "error" || type === "warning" ? "alert" : "status"}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="m-0 font-semibold">{title}</p>
              {message && <p className="m-0 mt-0.5">{message}</p>}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-lg p-1 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              aria-label="Cerrar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        </MensajeEstado>
      </div>
    </div>,
    document.body
  );
}
