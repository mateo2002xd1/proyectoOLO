/**
 * Comprueba que la bitácora de RF-07 **escribe de verdad** y que solo la lee quien debe.
 *
 * Existe por un caso concreto: durante meses el modelo, el repositorio, el
 * use-case y las rutas de auditoría estuvieron completos y el backlog los daba
 * por terminados, pero la tabla no recibía una sola fila. Dos causas, ninguna
 * visible desde fuera:
 *
 *   1. La migración 006 renombró las columnas al español y tradujo los verbos de
 *      acción, y quien escribía siguió mandando `'create'`. El CHECK lo rechazaba.
 *   2. Nadie esperaba la promesa del INSERT, así que el rechazo se perdía como
 *      *unhandled rejection*: sin excepción, sin log, sin rastro.
 *
 * Un typecheck no detecta ninguna de las dos. Por eso esta prueba escribe una
 * fila real, la lee y la borra.
 *
 * Se ejecuta con `npm run auditoria:verificar`. Las comprobaciones de permisos no
 * necesitan base de datos; las de escritura sí, y si no hay conexión el script lo
 * dice y termina en fallo en vez de aparentar que pasó.
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import sequelize from '../src/config/database';
import { ContentAuditLog } from '../src/infrastructure/db/models';
import { AuditRepository } from '../src/repositories/auditoria.repository';
import { logAudit } from '../src/use-cases/auditoria/audit.usecase';
import { auditoriaPolicies } from '../src/policies/auditoria.policies';

let fallos = 0;

const comprobar = (descripcion: string, obtenido: unknown, esperado: unknown) => {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) fallos += 1;
  console.log(
    `  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion}` +
      (ok ? '' : ` → ${JSON.stringify(obtenido)} (esperado ${JSON.stringify(esperado)})`)
  );
};

/**
 * Quién puede leer la bitácora. No toca la base: la política es una función pura.
 * Se comprueban también las variantes de capitalización porque el rol llega desde
 * el JWT tal cual está en la tabla ('Administrador'), y comparar literal fue justo
 * el error que dejó las políticas de páginas devolviendo `false` para todos.
 */
const verificarPermisos = () => {
  console.log('\n=== Quién puede leer la bitácora ===');
  comprobar("'Superadmin' puede", auditoriaPolicies.puedeVer('Superadmin'), true);
  comprobar("'Administrador' puede", auditoriaPolicies.puedeVer('Administrador'), true);
  comprobar("'administrador' (minúsculas) puede", auditoriaPolicies.puedeVer('administrador'), true);
  comprobar("'Editor' NO puede", auditoriaPolicies.puedeVer('Editor'), false);
  comprobar("'Director' NO puede", auditoriaPolicies.puedeVer('Director'), false);
  comprobar("'Subdirector' NO puede", auditoriaPolicies.puedeVer('Subdirector'), false);
  comprobar("'visitante_interno' NO puede", auditoriaPolicies.puedeVer('visitante_interno'), false);
  comprobar('sin rol NO puede', auditoriaPolicies.puedeVer(undefined), false);
};

/** Escribe una fila real, la lee y la borra. Es la prueba que faltaba. */
const verificarEscritura = async () => {
  console.log('\n=== La bitácora escribe de verdad ===');

  const entidadId = randomUUID();

  await logAudit({
    entidadId,
    entidadTipo: 'pagina',
    usuarioId: null,
    usuarioNombre: 'Prueba automática',
    accion: 'publicar',
    camposModificados: [{ campo: 'version', antes: 3, despues: 4 }],
    ip: '127.0.0.1',
    userAgent: 'verificar-auditoria',
  });

  const filas = await AuditRepository.findByContentId(entidadId, 'pagina');
  comprobar('se escribió exactamente una fila', filas.length, 1);

  if (filas.length === 1) {
    const fila = filas[0] as any;
    comprobar('guarda la acción', fila.accion, 'publicar');
    comprobar('guarda el tipo de entidad', fila.entidad_tipo, 'pagina');
    comprobar('guarda el nombre del usuario', fila.usuario_nombre, 'Prueba automática');
    comprobar('guarda la IP', String(fila.ip), '127.0.0.1');
    comprobar('guarda el user-agent', fila.user_agent, 'verificar-auditoria');

    // Se comparan los valores uno a uno y no el objeto entero: JSONB no conserva
    // el orden de las claves (devuelve `antes, campo, despues`, alfabético), así
    // que comparar el JSON serializado falla aunque el dato sea idéntico.
    const campo = fila.campos_modificados?.[0] ?? {};
    comprobar('guarda qué campo cambió', campo.campo, 'version');
    comprobar('guarda el valor anterior', campo.antes, 3);
    comprobar('guarda el valor nuevo', campo.despues, 4);

    // `createdAt`, no `created_at`: el modelo declara la propiedad en snake_case
    // pero Sequelize la expone en camelCase (`"created_at" AS "createdAt"`).
    comprobar('pone la fecha', (fila.createdAt ?? fila.created_at) instanceof Date, true);
  }

  await ContentAuditLog.destroy({ where: { entidad_id: entidadId } });

  // El CHECK de la migración 006 es la red que atrapó el bug original. Si alguien
  // lo quita, esta prueba deja de proteger y hay que enterarse.
  console.log('\n=== El CHECK sigue rechazando los verbos en inglés ===');
  let rechazado = false;
  try {
    // El `as any` es a propósito: en TypeScript esto ya no compila —que es la
    // otra mitad del arreglo—, así que hay que forzarlo para probar la base.
    await AuditRepository.create({
      entidadId: randomUUID(),
      entidadTipo: 'pagina',
      accion: 'create' as any,
    });
  } catch {
    rechazado = true;
  }
  comprobar("la base rechaza accion 'create'", rechazado, true);
};

const main = async () => {
  verificarPermisos();

  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error(
      '\n  FALLA  no hay conexión con la base de datos: la escritura no se pudo verificar.\n' +
        '         Levanta Postgres (docker compose up -d db) y vuelve a ejecutarlo.\n',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }

  await verificarEscritura();
  await sequelize.close();

  console.log(fallos === 0 ? '\nTODO OK\n' : `\n${fallos} FALLOS\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error('\nLa verificación se interrumpió:', error);
  process.exit(1);
});
