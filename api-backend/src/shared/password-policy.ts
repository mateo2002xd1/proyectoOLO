import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Directivas de contraseñas de OLO — §1 y §3 de `4-reglas.md`.
 *
 * **Este archivo es el único sitio donde vive la regla.** Existe porque la política
 * se validaba en cinco lugares distintos con cinco criterios distintos: tres
 * use-cases del backend comprobaban `length < 8`, los formularios de las dos apps
 * repetían el mismo 8 por su cuenta, y `updateUser` —por donde un administrador
 * fija la contraseña de otro— no comprobaba absolutamente nada. La consideración 1
 * del proyecto es explícita: la validación se hace en el servidor, y por tanto
 * quien escriba un hash tiene que pasar por aquí.
 */

/** §1: longitud mínima, en caracteres (no en unidades UTF-16). */
export const LONGITUD_MINIMA = 12;

/**
 * §1 dice 256, pero el límite real lo pone bcrypt: **ignora todo lo que pase de 72
 * bytes**. Aceptar 256 sería mentir sobre lo que el sistema comprueba — dos
 * contraseñas que compartan los primeros 72 bytes abrirían la misma cuenta. Se
 * valida el límite verdadero y se rechaza antes de hashear, en vez de truncar en
 * silencio. Si algún día se migra a argon2 esta constante desaparece.
 */
export const MAX_BYTES = 72;

/** §1: hay que cumplir 3 de las 4 categorías. */
export const CATEGORIAS_REQUERIDAS = 3;

/** §3: intentos fallidos de inicio de sesión antes de bloquear. */
export const INTENTOS_MAXIMOS_LOGIN = 5;

/** §3: duración del bloqueo temporal, en minutos. */
export const MINUTOS_BLOQUEO_LOGIN = 15;

/** §3: coste de bcrypt. Es el que ya usaba todo el código; se centraliza aquí. */
export const BCRYPT_ROUNDS = 12;

/**
 * Caracteres de las categorías «otro» de Unicode: control, formato (incluye los de
 * ancho cero), surrogates sueltos, uso privado y no asignados. Ninguno se puede
 * teclear de forma reproducible, así que una contraseña que los contenga es una
 * contraseña que su dueño no podrá volver a escribir.
 */
const CATEGORIA_PROHIBIDA = /\p{C}/u;

/** Emojis y pictogramas: §1 los excluye explícitamente. */
const PICTOGRAMA = /\p{Extended_Pictographic}/u;

/**
 * Cualquier espacio que no sea el U+0020 normal (tabulador, salto de línea, espacio
 * duro…). §1 admite «espacio en blanco» y eso es el espacio de la barra: un NBSP
 * copiado desde Word es indistinguible a la vista y deja al usuario fuera de su
 * cuenta sin explicación posible.
 */
const ESPACIO_ENGANOSO = /[^\S ]/u;

const MAYUSCULA = /\p{Lu}/u;
const MINUSCULA = /\p{Ll}/u;
const DIGITO = /\p{Nd}/u;
/** Todo lo que no es letra ni número: puntuación, símbolos y el espacio. */
const SIMBOLO = /[\p{P}\p{S} ]/u;

/**
 * Forma canónica de la contraseña.
 *
 * `ñ` se puede escribir como un solo carácter o como `n` + tilde combinante; son
 * secuencias de bytes distintas que se ven igual. Sin normalizar, la contraseña que
 * el usuario fijó desde un teclado y la que teclea desde otro pueden no coincidir.
 * **El valor normalizado es el que se hashea**, y `compararPassword` normaliza del
 * mismo modo al verificar.
 */
export const normalizarPassword = (password: string): string => password.normalize('NFC');

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
}

/**
 * Comprueba una contraseña contra §1. Devuelve **todos** los incumplimientos, no
 * solo el primero: quien está eligiendo una contraseña necesita saber todo lo que
 * le falta de una vez, no descubrirlo de uno en uno.
 */
export const validarPassword = (password: unknown): ResultadoValidacion => {
  const errores: string[] = [];

  if (typeof password !== 'string' || password.length === 0) {
    return { valido: false, errores: ['La contraseña es obligatoria'] };
  }

  const normalizada = normalizarPassword(password);
  // Por caracteres, no por `.length`: en UTF-16 una `𝕏` cuenta como dos y el
  // usuario ve una.
  const caracteres = [...normalizada].length;
  const bytes = Buffer.byteLength(normalizada, 'utf8');

  if (caracteres < LONGITUD_MINIMA) {
    errores.push(`Debe tener al menos ${LONGITUD_MINIMA} caracteres`);
  }

  if (bytes > MAX_BYTES) {
    // Se habla de bytes y no de caracteres porque con acentos no coinciden: `ñ`
    // ocupa dos. Decir «72 caracteres» sería falso para quien usa tildes.
    errores.push(`Es demasiado larga (máximo ${MAX_BYTES} bytes; las letras acentuadas ocupan 2)`);
  }

  if (CATEGORIA_PROHIBIDA.test(normalizada) || PICTOGRAMA.test(normalizada)) {
    errores.push('No puede contener emojis ni caracteres invisibles');
  }

  if (ESPACIO_ENGANOSO.test(normalizada)) {
    errores.push('Solo se admite el espacio normal, no tabulaciones ni saltos de línea');
  }

  const categorias = [MAYUSCULA, MINUSCULA, DIGITO, SIMBOLO].filter((re) =>
    re.test(normalizada)
  ).length;

  if (categorias < CATEGORIAS_REQUERIDAS) {
    errores.push(
      `Debe combinar al menos ${CATEGORIAS_REQUERIDAS} de estas 4: mayúsculas, minúsculas, números y símbolos`
    );
  }

  return { valido: errores.length === 0, errores };
};

/**
 * Marca de los errores que lanza `exigirPasswordValida`.
 *
 * Sirve para distinguirlos de los demás 400. Importa en la recuperación de cuenta:
 * ese controlador sustituye a propósito cualquier error por un mensaje genérico para
 * no revelar si un correo existe, y sin esta marca el usuario recibiría «no fue
 * posible recuperar la contraseña» cuando lo único que pasa es que eligió una débil
 * —sin forma de saber qué corregir—. Un incumplimiento de la política habla de lo
 * que acaba de teclear, no de la cuenta, así que se puede devolver tal cual.
 */
export const CODIGO_PASSWORD_INVALIDA = 'PASSWORD_INVALIDA';

/** ¿Es este error un incumplimiento de la política, y por tanto seguro de mostrar? */
export const esErrorDePolitica = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as any).codigo === CODIGO_PASSWORD_INVALIDA;

/**
 * Valida y devuelve la contraseña ya normalizada, lista para hashear.
 *
 * Lanza con `status` 400 igual que el resto de use-cases (la convención del
 * backend es `Object.assign(new Error(...), { status })`, no las clases de
 * `shared/errors`, que nadie usa todavía).
 *
 * **Devuelve un valor a propósito**: obliga a quien llama a hashear lo que salió de
 * aquí y no lo que entró, que es lo único que mantiene coherente la normalización.
 */
export const exigirPasswordValida = (password: unknown): string => {
  const { valido, errores } = validarPassword(password);
  if (!valido) {
    throw Object.assign(new Error(errores.join('. ')), {
      status: 400,
      codigo: CODIGO_PASSWORD_INVALIDA,
      errores,
    });
  }
  return normalizarPassword(password as string);
};

/** Hashea aplicando antes la política. Es la única forma correcta de fijar una contraseña. */
export const hashearPassword = async (password: unknown): Promise<string> =>
  bcrypt.hash(exigirPasswordValida(password), BCRYPT_ROUNDS);

/**
 * Verifica una contraseña contra su hash.
 *
 * Prueba primero el texto tal cual llegó y solo después la forma normalizada. El
 * orden importa por compatibilidad: las contraseñas anteriores a este módulo se
 * hashearon sin normalizar, y comparar únicamente la forma NFC habría dejado fuera
 * a quien tuviera una tilde guardada en forma descompuesta. El segundo `compare`
 * solo llega a ejecutarse si el primero falla y la normalización cambió algo.
 */
export const compararPassword = async (candidato: string, hash: string): Promise<boolean> => {
  if (await bcrypt.compare(candidato, hash)) return true;

  const normalizado = normalizarPassword(candidato);
  if (normalizado === candidato) return false;
  return bcrypt.compare(normalizado, hash);
};

/**
 * Contraseña temporal para altas y restablecimientos.
 *
 * `base64url` da mayúsculas, minúsculas, dígitos y `-_`, pero **no garantiza** que
 * salgan tres categorías: una tirada puede quedarse en minúsculas y dígitos. Antes
 * eso no importaba porque nadie validaba; ahora una temporal que incumple §1 sería
 * una contraseña que el sistema emite y luego rechaza. Por eso se comprueba y se
 * repite la tirada.
 */
export const generarPasswordTemporal = (): string => {
  // 20 intentos es un margen enorme para algo que casi siempre acierta a la
  // primera; el tope existe para que un fallo futuro sea un error y no un cuelgue.
  for (let intento = 0; intento < 20; intento++) {
    const candidata = crypto.randomBytes(16).toString('base64url').slice(0, 16);
    if (validarPassword(candidata).valido) return candidata;
  }
  throw new Error('No se pudo generar una contraseña temporal que cumpla la política');
};
