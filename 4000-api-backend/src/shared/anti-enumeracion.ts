/**
 * Piezas para que las pantallas sin sesión (login, recuperación de contraseña) no sirvan
 * para averiguar qué cuentas existen ni en qué estado están.
 *
 * Una respuesta delata una cuenta de dos maneras: por **lo que dice** (404 «Usuario no
 * encontrado» contra 401 «respuestas incorrectas») y por **lo que tarda** (si el usuario
 * no existe no se ejecuta bcrypt, que cuesta unos 250 ms; si existe, sí). Las dos se
 * cierran aquí: el texto, con respuestas idénticas; el tiempo, con una comparación de
 * relleno contra un hash que no es de nadie.
 *
 * @see auditorias/2026-10-22-fuga-de-informacion-en-errores.md
 */
import { createHmac } from 'crypto';
import { config } from '../config';
import { compararPassword } from './password-policy';

/**
 * Hash bcrypt (coste 12, el de `BCRYPT_ROUNDS`) de una cadena aleatoria que no se guardó
 * en ningún sitio. Existe solo para que `bcrypt.compare` tarde lo mismo cuando la cuenta
 * no existe, está bloqueada o no tiene preguntas.
 */
const HASH_DE_RELLENO = '$2b$12$7W97Pz6QUfIg0uZOYQctZeAxHOCOs/I5fzEmPcqoQpsxF0kxJs9.i';

/** Gasta el tiempo de una comparación de contraseña, y siempre resulta falsa. */
export const gastarComparacionDeRelleno = async (candidato: unknown): Promise<void> => {
  await compararPassword(typeof candidato === 'string' ? candidato : '', HASH_DE_RELLENO);
};

/**
 * Elige `cuantas` entradas de la lista **siempre las mismas** para una misma semilla.
 *
 * Sirve para inventar las preguntas de seguridad de un correo que no existe: si salieran
 * al azar, pedir dos veces las del mismo correo daría dos listas distintas y eso solo pasa
 * con las cuentas que no existen. Con HMAC y el secreto del servidor, nadie de fuera puede
 * calcular de antemano cuáles le tocan a un correo.
 */
export const elegirSiempreLasMismas = <T>(semilla: string, lista: readonly T[], cuantas: number): T[] => {
  const bytes = createHmac('sha256', config.jwtSecret).update(`olo:simulacion:${semilla}`).digest();
  const restantes = [...lista];
  const elegidas: T[] = [];
  for (let i = 0; i < cuantas && restantes.length > 0; i += 1) {
    elegidas.push(restantes.splice(bytes[i] % restantes.length, 1)[0]);
  }
  return elegidas;
};
