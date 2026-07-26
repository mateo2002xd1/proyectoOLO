"use client";

import { useEffect, useState } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

const colors: Record<NotificationType, string> = {
  success: "bg-brand",
  error: "bg-[#dc2626]",
  warning: "bg-[#fdcf33]",
  info: "bg-[#1face3]",
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
  const bgColor = colors[type];

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

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-end justify-end pointer-events-none sm:bottom-8 sm:right-8">
      <div
        className={`pointer-events-auto w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl ${bgColor} text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out ${
          isVisible && !isLeaving
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className="m-0 text-sm font-semibold text-white">{title}</p>
            {message && (
              <p className="m-0 mt-1 text-xs text-white/90">{message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
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
    </div>
  );
}
