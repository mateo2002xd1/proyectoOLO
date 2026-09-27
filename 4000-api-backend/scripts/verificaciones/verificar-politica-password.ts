/**
 * Comprueba la política de contraseñas (§1 y §3 de `4-reglas.md`) contra el
 * validador real, no contra lo que uno cree que valida.
 *
 * No toca la base de datos: `password-policy.ts` es lógica pura. Existe como script
 * y no como test porque el backend todavía no tiene framework de pruebas, y la
 * convención del repo para esto son los `verificar-*.ts`.
 *
 * Los casos con `ñ` y tildes son deliberados: §1 escrito al pie de la letra los
 * prohibiría, y en un producto del SENA los usuarios van a escribirlos. La decisión
 * del proyecto fue admitir letras acentuadas y bloquear solo lo que de verdad no se
 * puede volver a teclear (emojis, invisibles, espacios engañosos).
 */
import {
  validarPassword,
  generarPasswordTemporal,
  compararPassword,
  hashearPassword,
  LONGITUD_MINIMA,
  MAX_BYTES,
} from '../../src/shared/password-policy';

let fallos = 0;

/** Imprime OK o FALLA para una comprobación (con el detalle si falla) y cuenta los fallos. */
const comprobar = (descripcion: string, obtenido: boolean, esperado: boolean, detalle = '') => {
  const ok = obtenido === esperado;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion} → ${obtenido} (esperado ${esperado})`);
  if (!ok && detalle) console.log(`         ${detalle}`);
};

/** Se escribe con escape para que el archivo no dependa de su propia codificación. */
const CON_ENIE = 'Contraseña2026!';

/** [contraseña, debe ser válida, por qué] */
const CASOS: [string, boolean, string][] = [
  ['Contrasena2026!', true, 'ASCII con las 4 categorías'],
  [CON_ENIE, true, 'con ñ'],
  ['Águila-Verde-99', true, 'con tilde'],
  ['Abcdefghijk1', true, 'may + min + dígito = 3 categorías'],
  ['contrasena 2026', true, 'min + dígito + espacio como símbolo'],

  ['abcdefghijklmn', false, 'solo minúsculas: 1 categoría'],
  ['Abcdefghijklmn', false, 'may + min: 2 categorías'],
  ['Corto1!', false, `menos de ${LONGITUD_MINIMA} caracteres`],
  ['Contrasena2026!\u{1f600}', false, 'emoji'],
  ['Contrasena 2026!', false, 'espacio duro (NBSP), invisible a la vista'],
  ['Contrasena\t2026!', false, 'tabulador'],
  ['Contrasena​2026!', false, 'espacio de ancho cero'],
  ['A1!' + 'ñ'.repeat(40), false, `40 ñ = 80 bytes, pasa de ${MAX_BYTES}`],
  ['', false, 'vacía'],
];

/** Prueba la política de contraseñas con los casos de `CASOS`. */
const verificar = async (): Promise<void> => {
  console.log('\n=== §1 Composición ===');
  for (const [password, esperado, nota] of CASOS) {
    const { valido, errores } = validarPassword(password);
    comprobar(nota, valido, esperado, errores.join(' / '));
  }

  console.log('\n=== Contraseñas temporales ===');
  // Se generan con base64url, que no garantiza 3 categorías por sí solo: si el
  // generador dejara de comprobarlo, el sistema emitiría claves que él mismo
  // rechaza al usarlas.
  let todasValidas = true;
  for (let i = 0; i < 500; i++) {
    if (!validarPassword(generarPasswordTemporal()).valido) todasValidas = false;
  }
  comprobar('500 temporales generadas cumplen la política', todasValidas, true);

  console.log('\n=== Hasheo y verificación ===');
  const hash = await hashearPassword(CON_ENIE);
  comprobar('la misma contraseña con ñ verifica', await compararPassword(CON_ENIE, hash), true);
  comprobar(
    'una contraseña distinta no verifica',
    await compararPassword('Contraseña2027!', hash),
    false
  );

  // 'ñ' precompuesta y 'n' + tilde combinante se ven igual y son bytes distintos.
  // Se hashea la forma normalizada, así que quien teclee la descompuesta debe entrar.
  comprobar(
    'la forma descompuesta de la misma contraseña verifica',
    await compararPassword(CON_ENIE.normalize('NFD'), hash),
    true
  );

  console.log(fallos === 0 ? '\nTodo correcto.\n' : `\n${fallos} comprobaciones fallaron.\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

verificar().catch((error) => {
  console.error(error);
  process.exit(1);
});
