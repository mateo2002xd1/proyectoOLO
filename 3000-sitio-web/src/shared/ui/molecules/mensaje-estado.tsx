import type { ReactNode } from 'react';

/**
 * Mensaje de estado: la tarjeta de color con su icono que se usa en todo el proyecto
 * (acceso, panel y editor) para contar algo sin que sea un campo ni un botón. Lo único
 * que cambia de un uso a otro es el texto de dentro; el tipo decide color e icono.
 *
 * Esquinas de 16 px y no las de 32 de campos y botones, para que no se confundan con
 * ellos (pedido del usuario, 2026-10-09). Van con valor explícito porque `rounded-xl`
 * no mide lo mismo en las dos apps.
 *
 * El mismo componente vive en `3001-intranet/src/shared/ui/molecules/mensaje-estado.tsx`:
 * un cambio aquí va también allí.
 */

export type TipoMensajeEstado = 'info' | 'advertencia' | 'error' | 'exito';

const ESTILOS: Record<TipoMensajeEstado, string> = {
  info: 'bg-[#e8f2fc] text-[#001631]',
  advertencia: 'bg-[#fff9e6] text-[#b48a00]',
  error: 'bg-[#ffe9e9] text-[#d90000]',
  exito: 'bg-[#ebf6e6] text-[#005524]',
};

/** La «i» del mockup. `currentColor`: toma el color del texto de cada tipo. */
function IconoInfo() {
  return (
    <svg
      className="mt-1 h-3 w-[5px] shrink-0"
      viewBox="0 0 10 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0.976562 20.7143H1.95312V13.6607H0.976562C0.437207 13.6607 0 13.2235 0 12.6841V10.3516C0 9.81221 0.437207 9.375 0.976562 9.375H6.44531C6.98467 9.375 7.42188 9.81221 7.42188 10.3516V20.7143H8.39844C8.93779 20.7143 9.375 21.1515 9.375 21.6909V24.0234C9.375 24.5628 8.93779 25 8.39844 25H0.976562C0.437207 25 0 24.5628 0 24.0234V21.6909C0 21.1515 0.437207 20.7143 0.976562 20.7143ZM4.6875 0C2.74585 0 1.17188 1.57397 1.17188 3.51562C1.17188 5.45728 2.74585 7.03125 4.6875 7.03125C6.62915 7.03125 8.20312 5.45728 8.20312 3.51562C8.20312 1.57397 6.6291 0 4.6875 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** El escudo con «!» del mockup, para las advertencias. */
function IconoAdvertencia() {
  return (
    <svg
      className="mt-[3px] h-3.5 w-3 shrink-0"
      viewBox="0 0 22 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18.2391 2.31856L11.3476 0.05551C11.122 -0.0185033 10.878 -0.0185033 10.6524 0.05551L3.7598 2.31856C2.6643 2.67719 1.7114 3.36667 1.03646 4.28905C0.361525 5.21142 -0.00113418 6.3198 2.66461e-06 7.45673V13.0001C2.66461e-06 21.1932 10.12 25.7182 10.5534 25.9067C10.694 25.9682 10.8461 26 11 26C11.1539 26 11.306 25.9682 11.4466 25.9067C11.88 25.7182 22 21.1932 22 13.0001V7.45673C22.0011 6.31967 21.6382 5.21119 20.9631 4.2888C20.2879 3.3664 19.3348 2.67701 18.2391 2.31856V2.31856ZM11 20.5833C10.7824 20.5833 10.5698 20.5197 10.3889 20.4007C10.208 20.2817 10.067 20.1125 9.98373 19.9145C9.90048 19.7166 9.87869 19.4988 9.92114 19.2886C9.96358 19.0785 10.0683 18.8854 10.2222 18.7339C10.376 18.5824 10.572 18.4793 10.7854 18.4375C10.9988 18.3957 11.22 18.4171 11.421 18.4991C11.622 18.5811 11.7937 18.72 11.9146 18.8981C12.0355 19.0763 12.1 19.2857 12.1 19.5C12.1 19.7873 11.9841 20.0628 11.7778 20.266C11.5715 20.4691 11.2917 20.5833 11 20.5833ZM12.1 15.1667C12.1 15.454 11.9841 15.7296 11.7778 15.9327C11.5715 16.1359 11.2917 16.25 11 16.25C10.7083 16.25 10.4285 16.1359 10.2222 15.9327C10.0159 15.7296 9.9 15.454 9.9 15.1667V6.50016C9.9 6.21285 10.0159 5.9373 10.2222 5.73414C10.4285 5.53098 10.7083 5.41684 11 5.41684C11.2917 5.41684 11.5715 5.53098 11.7778 5.73414C11.9841 5.9373 12.1 6.21285 12.1 6.50016V15.1667Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * El círculo con «×» del mockup, para errores y rechazos. Exportado para lo que no es una
 * tarjeta pero lleva el mismo icono (el diálogo del motivo de rechazo del editor, los
 * requisitos pendientes de la contraseña). `className` cambia tamaño y margen; sin ella, los
 * de la tarjeta.
 */
export function IconoError({ className = 'mt-[3px] h-3.5 w-3.5 shrink-0' }: { className?: string } = {}) {
  return (
    <svg
      className={className}
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 0C5.37258 0 0 5.37258 0 12C0 18.6274 4.43919 23.0627 11 24C13.1924 24.3132 15.7772 24.4302 18.5085 24.351C21.5008 24.2643 23.9888 22.0352 24.212 19.05C24.4361 16.0524 24.3212 13.0698 24 10.5C23 4 18.6245 0.00717187 12 0ZM16 14.587C16.4063 14.961 16.4326 15.5936 16.0586 16C15.6846 16.4063 15.0519 16.4326 14.6456 16.0586C14.6252 16.0399 14.6057 16.0203 14.587 16L12 13.414L9.414 16C9.01673 16.3837 8.38369 16.3726 8.00002 15.9754C7.62577 15.5879 7.62577 14.9735 8.00002 14.586L10.586 12L8.00002 9.414C7.61634 9.01673 7.62736 8.38369 8.02462 8.00002C8.41214 7.62577 9.02648 7.62577 9.414 8.00002L12 10.586L14.587 8.00002C14.961 7.59366 15.5936 7.56741 16 7.94142C16.4063 8.31544 16.4326 8.94806 16.0586 9.35442C16.0399 9.37477 16.0203 9.39427 16 9.41302L13.414 12L16 14.587Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * El globo con «✓» del mockup, para lo que salió bien. Exportado como `IconoError`: lo usan
 * también los requisitos cumplidos de la contraseña.
 */
export function IconoExito({ className = 'mt-[3px] h-3.5 w-[13px] shrink-0' }: { className?: string } = {}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18.6296 0.709847L6.44957 -0.000152748C3.35958 -0.170153 0.709575 2.18985 0.529575 5.28985L-0.00042465 14.4398C-0.170425 17.4098 1.99957 19.9698 4.90957 20.3198L4.34958 23.8598C4.18958 24.8798 5.31958 25.5898 6.16958 25.0098L12.3196 20.7698L17.4496 21.0598C20.5396 21.2398 23.1896 18.8698 23.3696 15.7798L23.8996 6.62985C24.0796 3.53985 21.7096 0.889847 18.6196 0.709847H18.6296ZM19.1696 8.36985C18.8496 8.63985 18.5296 8.90985 18.1996 9.18985C15.9596 11.0998 13.7096 12.9998 11.4596 14.9098C10.8296 15.4498 9.95958 15.4998 9.33958 14.9098C8.27958 13.9098 7.22958 12.9098 6.16958 11.9098C5.57958 11.3498 5.60958 10.3498 6.16958 9.78985C6.75958 9.19985 7.70958 9.22985 8.28958 9.78985C9.01958 10.4698 9.73958 11.1598 10.4596 11.8398C12.6496 9.96985 14.8496 8.10985 17.0496 6.24985C17.6696 5.71985 18.5596 5.62985 19.1696 6.24985C19.7096 6.78985 19.7896 7.83985 19.1696 8.36985Z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICONOS: Record<TipoMensajeEstado, ReactNode> = {
  info: <IconoInfo />,
  advertencia: <IconoAdvertencia />,
  error: <IconoError />,
  exito: <IconoExito />,
};

export function MensajeEstado({
  tipo,
  children,
  rol = 'status',
  className = '',
}: {
  tipo: TipoMensajeEstado;
  children: ReactNode;
  /**
   * `status` (por defecto) para lo que aparece de pronto, como el aviso de sesión
   * cerrada: se anuncia sin interrumpir. `note` para lo que está fijo desde que se
   * abre la pantalla o el modal, que no hace falta anunciar. `alert` para lo que
   * pide hacer algo ya (no se pudo cargar y hay que reintentar).
   */
  rol?: 'status' | 'note' | 'alert';
  /** Márgenes de quien lo coloca; el mensaje no trae ninguno. */
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[16px] px-4 py-3 text-sm leading-5 ${ESTILOS[tipo]} ${className}`}
      role={rol}
    >
      {ICONOS[tipo]}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
