/**
 * Comprueba los permisos de páginas contra los nombres de rol que hay de verdad en
 * la tabla `roles`, no contra los que uno supone.
 *
 * Los roles están capitalizados ('Editor', 'Superadmin') y las políticas comparaban
 * en minúsculas: la verificación daba `false` para todo el mundo sin fallar en
 * ningún sitio. Esta prueba existe para que eso no vuelva a pasar en silencio.
 */
import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import { paginasPolicies } from '../../src/policies/paginas.policies';

// Lo que se espera de cada rol: [ve, edita, aprueba]
const ESPERADO: Record<string, [boolean, boolean, boolean]> = {
  Superadmin: [true, true, true],
  Administrador: [true, true, true],
  Editor: [true, true, false],
  'Director/Subdirector': [true, false, false],
};

let fallos = 0;

const comprobar = (descripcion: string, obtenido: boolean, esperado: boolean) => {
  const ok = obtenido === esperado;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion} → ${obtenido} (esperado ${esperado})`);
};

const verificar = async (): Promise<void> => {
  await sequelize.authenticate();

  const roles = await sequelize.query<{ nombre: string }>(
    'SELECT nombre FROM roles ORDER BY nombre;',
    { type: QueryTypes.SELECT, logging: false }
  );

  console.log('\n=== Permisos por rol (nombres tal cual están en la base) ===');
  for (const { nombre } of roles) {
    const esperado = ESPERADO[nombre];
    if (!esperado) {
      console.log(`  AVISO  rol '${nombre}' sin expectativa definida en esta prueba`);
      continue;
    }
    console.log(`\n  [${nombre}]`);
    comprobar('ve', paginasPolicies.puedeVer(nombre), esperado[0]);
    comprobar('edita', paginasPolicies.puedeEditar(nombre), esperado[1]);
    comprobar('aprueba', paginasPolicies.puedePublicar(nombre), esperado[2]);
  }

  console.log('\n=== Casos límite ===');
  comprobar('rol vacío no edita', paginasPolicies.puedeEditar(''), false);
  comprobar('rol nulo no edita', paginasPolicies.puedeEditar(null), false);
  comprobar('rol desconocido no edita', paginasPolicies.puedeEditar('Invitado'), false);
  comprobar('el rol admite espacios sobrantes', paginasPolicies.puedeEditar('  Editor  '), true);
  comprobar('LOCAL_AUTH_ROLE por defecto aprueba', paginasPolicies.puedePublicar('Superadmin'), true);

  console.log(`\n${fallos === 0 ? 'Todo correcto.' : `${fallos} comprobación(es) fallaron.`}\n`);
};

verificar()
  .then(async () => {
    await sequelize.close();
    process.exit(fallos === 0 ? 0 : 1);
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
