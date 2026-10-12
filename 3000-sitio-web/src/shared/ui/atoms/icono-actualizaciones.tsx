import type { SVGProps } from 'react';

export interface IconoActualizacionesProps extends SVGProps<SVGSVGElement> {
  /** Color de relleno de la silueta. Por defecto usa `currentColor` para sincronizar con los estados activo y hover. */
  colorIcono?: string;
}

/**
 * Logotipo / icono de la sección «Actualizaciones» del panel.
 * Nube estilizada con flecha de subida recortada.
 *
 * viewBox="0 0 25 19"
 */
export function IconoActualizaciones({
  colorIcono,
  className = '',
  fill,
  ...props
}: IconoActualizacionesProps) {
  const color = colorIcono ?? (fill && fill !== 'none' ? fill : 'currentColor');

  return (
    <svg
      width="25"
      height="19"
      viewBox="0 0 25 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M21 8.15089C21.1602 7.73292 21.25 7.27589 21.25 6.79933C21.25 4.72902 20 2.5499 17.5 1.04933C15.1914 -0.336385 13 0.0493284 13 0.0493284C13 0.0493284 9.6875 0.0493284 8 1.04933C7.22205 1.51033 3.75 3.3462 3.75 6.79933C3.75 6.9048 3.75391 7.01027 3.75781 7.11573C1.57031 7.88527 0 9.9712 0 12.4243C0 15.5298 2.51953 18.0493 5.625 18.0493H20C22.7617 18.0493 25 15.811 25 13.0493C25 10.6314 23.2812 8.61183 21 8.15089ZM16.6758 11.2802H14.1211V16.3282C14.1211 16.7248 13.8398 17.0493 13.4961 17.0493H11.6211C11.2773 17.0493 10.9961 16.7248 10.9961 16.3282V11.2802H8.44141C7.88281 11.2802 7.60547 10.505 8 10.0498L12.1172 5.29933C12.3594 5.01989 12.7578 5.01989 13 5.29933L17.1172 10.0498C17.5117 10.505 17.2305 11.2802 16.6758 11.2802Z"
        fill={color}
      />
    </svg>
  );
}
