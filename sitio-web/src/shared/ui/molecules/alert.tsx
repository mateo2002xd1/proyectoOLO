"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type AlertProps = {
  open: boolean;
  onClose: (value: boolean) => void;
  children: ReactNode;
};

export function Alert({ open, onClose, children }: AlertProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-[#0f172a]/40 backdrop-blur-sm p-4"
      // Usamos `onMouseDown` y no `onClick`: si el usuario selecciona texto dentro
      // del cuadro y suelta el ratón fuera, el clic se contabiliza en el fondo y
      // el cuadro se cerraba en mitad de la selección.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose(false);
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-[0_24px_48px_-20px_rgba(0,0,0,0.15)] dark:bg-[#1e2538] overflow-visible"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="px-6 py-6 sm:px-8 sm:py-7 overflow-visible">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function AlertTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 text-base font-semibold text-[#1f2340] dark:text-[#e6e8f0]">
      {children}
    </h2>
  );
}

export function AlertDescription({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 text-sm text-[#667085] dark:text-[#95a0b8]">
      {children}
    </div>
  );
}

export function AlertActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      {children}
    </div>
  );
}
