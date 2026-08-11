/**
 * Directivas de contraseñas de OLO, §1 — la copia que consumen los formularios.
 *
 * ## Por qué existe una segunda copia
 *
 * La autoridad es `api-backend/src/shared/password-policy.ts` y **no cambia**: la
 * consideración 1 del proyecto es explícita en que la política se valida en el
 * servidor. Lo de aquí es solo la capa de interfaz: decirle a alguien qué le falta
 * *mientras escribe*, en vez de que lo descubra al enviar el formulario.
 *
 * Se comparte entre `intranet` y `sitio-web` —las dos apps tienen pantallas donde se
 * elige contraseña— porque el problema que se estaba arreglando era justamente ese:
 * la regla vivía repetida en cinco sitios con cinco criterios distintos. Dos copias
 * con responsabilidades separadas (una decide, otra explica) es manejable; cinco que
 * deciden, no.
 *
 * **Si cambias las reglas, cambia las dos.** El script
 * `npm run password:verificar` del backend comprueba la que manda.
 *
 * No importa `bcrypt` ni `crypto`: esto corre en el navegador. El hasheo, la
 * generación de temporales y la comparación viven solo en el servidor.
 */

/** §1: longitud mínima, en caracteres (no en unidades UTF-16). */
export const LONGITUD_MINIMA = 12;

/**
 * §1 dice 256, pero bcrypt ignora todo lo que pase de 72 bytes, así que ese es el
 * límite que el servidor comprueba de verdad. Se repite aquí para que el formulario
 * avise antes de enviar en vez de recibir un 400.
 */
export const MAX_BYTES = 72;

/** §1: hay que cumplir 3 de las 4 categorías. */
export const CATEGORIAS_REQUERIDAS = 3;

const CATEGORIA_PROHIBIDA = /\p{C}/u;
const PICTOGRAMA = /\p{Extended_Pictographic}/u;
const ESPACIO_ENGANOSO = /[^\S ]/u;

const MAYUSCULA = /\p{Lu}/u;
const MINUSCULA = /\p{Ll}/u;
const DIGITO = /\p{Nd}/u;
const SIMBOLO = /[\p{P}\p{S} ]/u;

/** Cuántos bytes UTF-8 ocupa, sin depender de `Buffer` (que en el navegador no hay). */
const bytesDe = (texto: string): number => new TextEncoder().encode(texto).length;

export interface RequisitoPassword {
  /** Identificador estable, para las `key` de React. */
  id: string;
  /** Cómo se le enuncia al usuario. Redactado en positivo: lo que debe cumplir. */
  etiqueta: string;
  cumplido: boolean;
}

/**
 * Estado de cada requisito de §1 para una contraseña dada.
 *
 * Devuelve **todos** los requisitos con su estado, no solo los que fallan: la lista
 * se pinta completa desde que el campo está vacío, para que quien elige contraseña
 * sepa a qué apunta antes de teclear, y no vaya descubriendo reglas a base de errores.
 */
export const requisitosDe = (password: string): RequisitoPassword[] => {
  const normalizada = password.normalize('NFC');
  const caracteres = [...normalizada].length;

  const categorias = [MAYUSCULA, MINUSCULA, DIGITO, SIMBOLO].filter((re) =>
    re.test(normalizada)
  ).length;

  return [
    {
      id: 'longitud',
      etiqueta: `Al menos ${LONGITUD_MINIMA} caracteres`,
      cumplido: caracteres >= LONGITUD_MINIMA,
    },
    {
      id: 'categorias',
      etiqueta: `Combina ${CATEGORIAS_REQUERIDAS} de 4: mayúsculas, minúsculas, números y símbolos`,
      cumplido: categorias >= CATEGORIAS_REQUERIDAS,
    },
    {
      id: 'caracteres',
      etiqueta: 'Sin emojis, caracteres invisibles ni tabulaciones',
      cumplido:
        caracteres > 0 &&
        !CATEGORIA_PROHIBIDA.test(normalizada) &&
        !PICTOGRAMA.test(normalizada) &&
        !ESPACIO_ENGANOSO.test(normalizada),
    },
    {
      id: 'maximo',
      // Se enuncia en caracteres aunque se mida en bytes: nadie cuenta bytes. El
      // caso realista que lo dispara es una frase larga con muchas tildes.
      etiqueta: 'No demasiado larga',
      cumplido: caracteres > 0 && bytesDe(normalizada) <= MAX_BYTES,
    },
  ];
};

/** ¿Cumple §1? Es lo que decide si el formulario deja enviar. */
export const cumplePolitica = (password: string): boolean =>
  password.length > 0 && requisitosDe(password).every((r) => r.cumplido);

/**
 * Mensaje corto para el campo cuando la contraseña no cumple.
 *
 * Solo nombra el primer requisito pendiente: la lista completa ya está a la vista
 * junto al campo, y repetirla entera en rojo no añade nada.
 */
export const primerFallo = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  const pendiente = requisitosDe(password).find((r) => !r.cumplido);
  return pendiente ? pendiente.etiqueta : null;
};
