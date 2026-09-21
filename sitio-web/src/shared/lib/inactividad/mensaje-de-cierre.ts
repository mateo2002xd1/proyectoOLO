import {
  MINUTOS_DE_INACTIVIDAD,
  MOTIVO_INACTIVIDAD,
  MOTIVO_INACTIVIDAD_SIN_GUARDAR,
} from '@olo/inactividad';
import { MOTIVO_SESION_EXPIRADA, MOTIVO_SIN_PERMISOS } from '../auth-cookies';

/**
 * Qué decirle a quien acaba de llegar al login desde un cierre por inactividad o permisos.
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
    // No es lo mismo que la inactividad: aquí la sesión dejó de ser válida por su
    // cuenta —caducó, o la API dejó de aceptar el token—, sin que la persona hiciera
    // nada. Antes esto no llegaba a decirse: el panel se quedaba vacío y en silencio,
    // y quien lo veía suponía que la base de datos estaba caída.
    case MOTIVO_SESION_EXPIRADA:
      return 'Tu sesión expiró. Vuelve a entrar para continuar donde estabas.';
    case MOTIVO_SIN_PERMISOS:
      return 'No tienes permisos para acceder a esta ruta. Por favor, ingresa con una cuenta autorizada.';
    default:
      return null;
  }
};
