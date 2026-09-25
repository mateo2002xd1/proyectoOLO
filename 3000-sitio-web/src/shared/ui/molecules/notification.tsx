"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

// Fondo Y color de texto por variante. No se puede fijar `text-white` para
// todas: sobre el amarillo da 1.48:1, el peor contraste del sistema de diseño.
// Cada par de abajo cumple el 4.5:1 de AA. Ver 9-accesibilidad.md §2.1.
// Las clases se escriben completas y literales: Tailwind escanea el código
// fuente, así que una clase construida por interpolación no se generaría.
const variantStyles: Record<
  NotificationType,
  { surface: string; text: string; subtle: string; close: string }
> = {
  success: {
    surface: "bg-brand-interactive",
    text: "text-white",
    subtle: "text-white/90",
    close: "text-white/80 hover:text-white",
  },
  error: {
    surface: "bg-[#dc2626]",
    text: "text-white",
    subtle: "text-white/90",
    close: "text-white/80 hover:text-white",
  },
  warning: {
    surface: "bg-[#fdcf33]",
    text: "text-[#1f2937]",
    subtle: "text-[#1f2937]/80",
    close: "text-[#1f2937]/80 hover:text-[#1f2937]",
  },
  info: {
    surface: "bg-brand-blue-dark",
    text: "text-white",
    subtle: "text-white/90",
    close: "text-white/80 hover:text-white",
  },
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
  const { surface, text, subtle, close } = variantStyles[type];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

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
    <div className="fixed bottom-6 right-6 z-[100] flex items-end justify-end pointer-events-none sm:bottom-8 sm:right-8">
      <div
        className={`pointer-events-auto w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl ${surface} ${text} shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out ${
          isVisible && !isLeaving
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className={`m-0 text-sm font-semibold ${text}`}>{title}</p>
            {message && (
              <p className={`m-0 mt-1 text-xs ${subtle}`}>{message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`shrink-0 rounded-lg p-1 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${close}`}
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
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
