import {
  MINUTOS_DE_INACTIVIDAD,
  MOTIVO_INACTIVIDAD,
  MOTIVO_INACTIVIDAD_SIN_GUARDAR,
} from '@olo/inactividad';

/**
 * Qué decirle a quien acaba de llegar al login desde un cierre por inactividad.
 *
 * Devuelve `null` cuando no hay motivo o no lo reconocemos: el parámetro llega en la
 * URL y cualquiera puede escribir lo que quiera ahí. Pintar el valor recibido sería
 * dejar que un enlace preparado ponga el texto que le apetezca sobre el formulario de
 * acceso — un buen sitio para colocar un «tu cuenta fue bloqueada, escribe a este
 * correo». Solo se pintan mensajes nuestros, elegidos por una clave conocida.
 */
export const mensajeDeCierre = (motivo: string | null): string | null => {
  switch (motivo) {
    case MOTIVO_INACTIVIDAD:
      return `Cerramos tu sesión porque estuviste ${MINUTOS_DE_INACTIVIDAD} minutos sin actividad. Vuelve a entrar para continuar.`;
    case MOTIVO_INACTIVIDAD_SIN_GUARDAR:
      return `Cerramos tu sesión por inactividad, pero no pudimos guardar los últimos cambios del editor. Revisa la página antes de seguir.`;
    default:
      return null;
  }
};
