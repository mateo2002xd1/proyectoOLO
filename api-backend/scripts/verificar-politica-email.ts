/**
 * Comprueba la restricción de dominio institucional contra el validador real.
 *
 * No toca la base de datos: `email-policy.ts` es lógica pura. Misma convención que
 * `verificar-politica-password.ts`.
 *
 * Los casos que de verdad importan son los tres últimos del primer bloque: son las
 * formas de colar un dominio ajeno que una comprobación ingenua con `includes` o sin
 * la arroba dejaría pasar.
 */
import {
  esDominioInstitucional,
  exigirEmailInstitucional,
  normalizarEmail,
  DOMINIO_INSTITUCIONAL,
} from '../src/shared/email-policy';

let fallos = 0;

const comprobar = (descripcion: string, obtenido: boolean, esperado: boolean) => {
  const ok = obtenido === esperado;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion} → ${obtenido} (esperado ${esperado})`);
};

/** [correo, se admite, por qué] */
const CASOS: [string, boolean, string][] = [
  ['usuario@sena.edu.co', true, 'correo institucional'],
  ['  Usuario@SENA.EDU.CO  ', true, 'mayúsculas y espacios: se normaliza'],
  ['nombre.apellido@sena.edu.co', true, 'con punto en la parte local'],

  ['usuario@gmail.com', false, 'dominio ajeno'],
  ['usuario@nosena.edu.co', false, 'termina en el dominio pero no es el dominio'],
  ['usuario@sena.edu.co.dominio-falso.com', false, 'contiene el dominio como subcadena'],
  ['usuario@sub.sena.edu.co', false, 'subdominio: no es el dominio institucional'],
  ['sena.edu.co', false, 'sin arroba, no es un correo'],
  ['usuario@', false, 'sin dominio'],
  ['', false, 'vacío'],
];

const verificar = (): void => {
  console.log(`\n=== Dominio institucional (@${DOMINIO_INSTITUCIONAL}) ===`);
  for (const [email, esperado, nota] of CASOS) {
    comprobar(nota, esDominioInstitucional(email) && email.trim() !== '', esperado);
  }

  console.log('\n=== exigirEmailInstitucional ===');
  // Debe devolver el correo ya normalizado: quien llama guarda lo que sale de aquí.
  const normalizado = exigirEmailInstitucional('  Usuario@SENA.EDU.CO ');
  comprobar(
    'devuelve el correo normalizado',
    normalizado === 'usuario@sena.edu.co',
    true
  );

  const rechaza = (email: string): boolean => {
    try {
      exigirEmailInstitucional(email);
      return false;
    } catch {
      return true;
    }
  };
  comprobar('rechaza un dominio ajeno', rechaza('usuario@gmail.com'), true);
  comprobar('rechaza un correo sin forma válida', rechaza('sin-arroba'), true);
  comprobar('acepta uno institucional', rechaza('usuario@sena.edu.co'), false);

  comprobar('normalizarEmail recorta y baja a minúsculas', normalizarEmail(' A@B.CO ') === 'a@b.co', true);

  console.log(fallos === 0 ? '\nTodo correcto.\n' : `\n${fallos} comprobaciones fallaron.\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

verificar();
