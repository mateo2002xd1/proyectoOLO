'use client';

import { MENSAJE_CONFIGURACION_PENDIENTE } from '@/shared/lib/errores-api';
import { Button } from '@/shared/ui/atoms/button';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';

interface AvisoErrorDeCargaProps {
  /** Qué no se pudo cargar, dicho como lo lee quien usa el panel. */
  titulo: string;
  /** El porqué, ya traducido (`mensajeDeErrorApi`). */
  mensaje: string;
  onReintentar: () => void;
  /** Mientras se reintenta, el botón se desactiva y lo dice. */
  reintentando?: boolean;
  /** Márgenes de quien lo coloca; el aviso no trae ninguno. */
  className?: string;
}

/**
 * Lo que ve quien usa el panel cuando una sección no pudo cargar sus datos: qué pasó,
 * qué hacer y un botón para volver a intentarlo, en vez de `Error: <mensaje de axios>`.
 *
 * En rojo, el mensaje de estado de error (`MensajeEstado`), por pedido del usuario el
 * 2026-10-15: antes iba en ámbar, como advertencia, porque no se pierde nada y casi siempre
 * se arregla reintentando. `role="alert"` para que el lector de pantalla lo anuncie al aparecer.
 *
 * Con la cuenta a medio configurar no es una avería (pedido del usuario, 2026-10-15): va
 * en advertencia, sin «Espera unos minutos…», y el botón lleva a terminar el primer
 * ingreso, porque reintentar daría el mismo 403. La carga completa (y no el router)
 * vuelve a pasar por el layout del panel, que también lo comprueba.
 */
export function AvisoErrorDeCarga({
  titulo,
  mensaje,
  onReintentar,
  reintentando = false,
  className,
}: AvisoErrorDeCargaProps) {
  const pendiente = mensaje === MENSAJE_CONFIGURACION_PENDIENTE;

  return (
    <MensajeEstado tipo={pendiente ? 'advertencia' : 'error'} rol="alert" className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {pendiente ? (
          // Con su propio texto (pedido del usuario, 2026-10-15): el título dice la causa y
          // no «No pudimos cargar…», que suena a avería, y el porqué va con lo que falta. La
          // segunda línea es para cuando la cuenta que la API ve no es la tuya: cookies de
          // otra sesión en el mismo navegador, como pasó con la de la intranet.
          <div className="min-w-0">
            <p className="font-semibold">Tu cuenta tiene la configuración pendiente</p>
            <p className="mt-1">
              Para continuar, termina de configurar tu contraseña y tus preguntas de seguridad.
            </p>
            <p className="mt-1">
              Si crees que es un error, borra las cookies de este sitio y vuelve a iniciar sesión.
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="font-semibold">{titulo}</p>
            <p className="mt-1">{mensaje}</p>
            <p className="mt-1">
              Espera unos minutos y pulsa «Reintentar», si el problema persiste contacta al equipo técnico.
            </p>
          </div>
        )}
        {pendiente ? (
          <Button
            variant="navy"
            onClick={() => window.location.assign(new URL('/login/first-login', window.location.origin))}
            className="shrink-0"
          >
            Terminar configuración
          </Button>
        ) : (
          <Button variant="navy" onClick={onReintentar} disabled={reintentando} className="shrink-0">
            {reintentando ? 'Reintentando…' : 'Reintentar'}
          </Button>
        )}
      </div>
    </MensajeEstado>
  );
}
