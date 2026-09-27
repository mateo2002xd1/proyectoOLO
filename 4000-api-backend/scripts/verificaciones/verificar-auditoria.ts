/**
 * Comprueba que la bitácora de RF-07 **escribe de verdad** y que solo la lee quien debe.
 *
 * Existe por un caso concreto: durante meses el modelo, el repositorio, el
 * use-case y las rutas de auditoría estuvieron completos y se daban por
 * terminados, pero la tabla no recibía una sola fila. Dos causas, ninguna
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
import sequelize from '../../src/config/database';
import { ContentAuditLog } from '../../src/infrastructure/db/models';
import { AuditRepository, MAX_POR_PAGINA, SQL_IDS_GUARDADOS_AUTOMATICOS } from '../../src/repositories/auditoria.repository';
import { logAudit } from '../../src/use-cases/auditoria/audit.usecase';
import { auditoriaPolicies } from '../../src/policies/auditoria.policies';
import { camposDe, VALOR_OMITIDO } from '../../src/shared/auditoria-campos';
import { datosDeAuditoria } from '../../src/shared/auditoria-request';
import { aRegistroAuditoria, filtrosDesdeQuery } from '../../src/shared/auditoria-dto';
import { categoriaDe, CATEGORIAS } from '../../src/shared/auditoria-categorias';

let fallos = 0;

/** Compara lo obtenido con lo esperado, imprime OK o FALLA y cuenta los fallos. */
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
  comprobar("'Director/Subdirector' NO puede", auditoriaPolicies.puedeVer('Director/Subdirector'), false);
  comprobar('sin rol NO puede', auditoriaPolicies.puedeVer(undefined), false);
};

/**
 * Una contraseña no puede acabar en la bitácora.
 *
 * `updateUser` acepta `password` en el cuerpo y la auditoría de usuarios registra
 * ese cuerpo: sin la sustitución, el primer cambio de contraseña de un
 * administrador quedaría escrito en claro en la tabla que más gente puede leer.
 * No toca la base — es una función pura, así que esta comprobación vale aunque no
 * haya Postgres delante.
 */
const verificarRedaccion = () => {
  console.log('\n=== Las contraseñas no llegan a la bitácora ===');

  const campos = camposDe({
    name: 'Ana Pérez',
    password: 'Sup3r-Secreta!',
    reset_password: true,
    role_id: 'rol-1',
  });

  const valor = (campo: string) => campos.find((c) => c.campo === campo)?.despues;

  comprobar('sustituye el valor de `password`', valor('password'), VALOR_OMITIDO);
  comprobar('la contraseña no aparece en ninguna parte', JSON.stringify(campos).includes('Sup3r-Secreta!'), false);
  comprobar('deja constancia de que el campo cambió', campos.some((c) => c.campo === 'password'), true);
  comprobar('no toca los campos normales', valor('name'), 'Ana Pérez');
  comprobar('`reset_password` sí se registra (no es un secreto)', valor('reset_password'), true);
  comprobar('detecta la variante en mayúsculas', camposDe({ Password: 'x' })[0]?.despues, VALOR_OMITIDO);
};

/**
 * El administrador maestro también deja rastro.
 *
 * La cuenta local entra con `id: 'local-auth'`, que no existe en `usuarios` y ni
 * siquiera es un UUID: mandarlo tal cual hacía saltar la clave foránea y `logAudit`
 * se comía el error, así que la cuenta con más poder era la única sin bitácora.
 */
const verificarUsuarioDeLaPeticion = () => {
  console.log('\n=== De quién es cada entrada ===');

  const peticion = (user: unknown) => datosDeAuditoria({ user, headers: {}, ip: '127.0.0.1' } as any);

  const local = peticion({ id: 'local-auth', name: 'Administrador local', role: 'Superadmin', isLocal: true });
  comprobar('la cuenta local no manda un id inexistente', local.usuarioId, null);
  comprobar('pero sí deja su nombre', local.usuarioNombre, 'Administrador local');

  const real = peticion({ id: '8c1ea919-e85d-4817-9eb6-999babc91d39', name: 'Ana' });
  comprobar('un usuario real sí manda su id', real.usuarioId, '8c1ea919-e85d-4817-9eb6-999babc91d39');

  comprobar('un id que no es UUID se descarta', peticion({ id: 'algo', name: 'X' }).usuarioId, null);
  comprobar('sin sesión no hay usuario', peticion(undefined).usuarioId, null);
};

/** Traducción del querystring a filtros y de la fila al DTO. También sin base. */
const verificarDto = () => {
  console.log('\n=== Querystring y DTO ===');

  comprobar('acepta una acción válida', filtrosDesdeQuery({ accion: 'crear' }).accion, 'crear');
  comprobar("descarta el verbo en inglés 'create'", filtrosDesdeQuery({ accion: 'create' }).accion, undefined);
  comprobar('descarta una entidad inventada', filtrosDesdeQuery({ entidadTipo: 'ovni' }).entidadTipo, undefined);
  comprobar('descarta una fecha ilegible', filtrosDesdeQuery({ desde: 'ayer' }).desde, undefined);
  comprobar('sigue admitiendo los nombres en inglés', filtrosDesdeQuery({ page: '3', contentType: 'pagina' }).pagina, 3);

  // Quien filtra "hasta el 4" espera que el día 4 entre entero: si se tomara a las
  // 00:00 se perdería todo lo que pasó ese día, que suele ser lo que se busca.
  const hasta = filtrosDesdeQuery({ hasta: '2026-08-04' }).hasta;
  comprobar('`hasta` con solo fecha cubre el día completo', hasta?.getHours(), 23);

  const dto = aRegistroAuditoria({
    id: 'id-1',
    entidad_id: 'entidad-1',
    entidad_tipo: 'pagina',
    usuario_id: null,
    usuario_nombre: 'Ana',
    accion: 'publicar',
    campos_modificados: null,
    ip: '127.0.0.1',
    user_agent: 'jest-menos',
    createdAt: new Date('2026-08-04T10:00:00.000Z'),
  });

  comprobar('traduce entidad_tipo → entidadTipo', dto.entidadTipo, 'pagina');
  comprobar('traduce user_agent → userAgent', dto.userAgent, 'jest-menos');
  comprobar('campos_modificados nulo sale como lista vacía', dto.camposModificados, []);
  comprobar('la fecha sale en ISO', dto.fecha, '2026-08-04T10:00:00.000Z');
  comprobar('publicar una página es de administración', dto.categoria, 'administracion');

  comprobar('acepta una categoría válida', filtrosDesdeQuery({ categoria: 'seguridad' }).categoria, 'seguridad');
  comprobar('descarta una categoría inventada', filtrosDesdeQuery({ categoria: 'ovni' }).categoria, undefined);
};

/**
 * La regla que reparte las filas en las tres categorías de la pantalla. Es pura, así
 * que vale sin base. Lo importante es lo que comparte verbo: `crear` y `actualizar`
 * sirven igual para una página que para una cuenta, y ahí decide la entidad.
 */
const verificarCategoriasPuras = () => {
  console.log('\n=== Categorías: a cuál pertenece cada fila ===');

  comprobar('crear una página → editorial', categoriaDe('crear', 'pagina'), 'editorial');

  comprobar('crear un usuario NO es editorial → seguridad', categoriaDe('crear', 'usuario'), 'seguridad');
  comprobar('editar una página → editorial', categoriaDe('actualizar', 'pagina'), 'editorial');
  comprobar('guardar borrador → editorial', categoriaDe('guardar_borrador', 'pagina'), 'editorial');
  comprobar('enviar a revisión → editorial', categoriaDe('enviar_revision', 'pagina'), 'editorial');
  comprobar('modificar un usuario → seguridad', categoriaDe('actualizar', 'usuario'), 'seguridad');
  comprobar('modificar un rol → seguridad', categoriaDe('actualizar', 'rol'), 'seguridad');

  comprobar('rechazar → administración', categoriaDe('rechazar', 'pagina'), 'administracion');
  comprobar('aprobar → administración', categoriaDe('aprobar', 'pagina'), 'administracion');

  comprobar('despublicar (archivar) → administración', categoriaDe('despublicar', 'pagina'), 'administracion');

  for (const accion of ['autenticar', 'expirar', 'inactivar', 'cambiar_password', 'bloquear', 'verificar_preguntas'] as const) {
    comprobar(`${accion} → seguridad`, categoriaDe(accion, 'usuario'), 'seguridad');
  }
  comprobar('eliminar un usuario → seguridad', categoriaDe('eliminar', 'usuario'), 'seguridad');
  comprobar('eliminar una página → seguridad (una sola «Eliminación»)', categoriaDe('eliminar', 'pagina'), 'seguridad');
  comprobar('eliminar de la configuración → seguridad', categoriaDe('eliminar', 'configuracion'), 'seguridad');

  comprobar('una fila que no encaja no tiene categoría', categoriaDe('actualizar', 'seccion'), null);
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

/**
 * Borrar a una persona no puede borrar lo que hizo.
 *
 * `usuario_id` tiene clave foránea contra `usuarios`, cosa que no era evidente
 * hasta que una fila de prueba con un id inventado la hizo saltar. Que sea
 * `ON DELETE SET NULL` es lo que da sentido a guardar `usuario_nombre` al lado del
 * id: al borrar la cuenta el rastro se queda, con el nombre puesto. Si alguien la
 * cambiara a `CASCADE`, la bitácora perdería justo la evidencia de quien se va —
 * por eso se comprueba.
 */
const verificarClaveForanea = async () => {
  console.log('\n=== Borrar un usuario no borra su rastro ===');

  const [filas] = await sequelize.query(`
    SELECT pg_get_constraintdef(con.oid) AS definicion
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
     WHERE rel.relname = 'auditoria_cambios' AND con.contype = 'f';
  `);

  const definicion = (filas as { definicion: string }[])[0]?.definicion ?? '';
  comprobar('la FK de usuario es ON DELETE SET NULL', definicion.includes('ON DELETE SET NULL'), true);
  comprobar('no es ON DELETE CASCADE', definicion.includes('CASCADE'), false);
};

/**
 * Los filtros y la paginación que consume la pantalla de RF-07.
 *
 * Las filas de prueba se cuelgan de un usuario **real** (lo exige la clave
 * foránea) y todas las consultas llevan `desde` a partir del instante justo
 * anterior a sembrarlas: así las cuentas son exactas aunque ese usuario ya tenga
 * historial en la base donde se ejecute.
 */
const verificarLectura = async () => {
  console.log('\n=== Filtros y paginación de la consulta ===');

  const [usuarios] = await sequelize.query('SELECT id FROM usuarios LIMIT 1;');
  const usuarioId = (usuarios as { id: string }[])[0]?.id;

  if (!usuarioId) {
    console.log('  AVISO  la base no tiene usuarios: no se pueden sembrar filas de prueba (la FK lo impide).');
    return;
  }

  const marca = new Date(Date.now() - 1000);
  const base = { usuarioId, desde: marca };

  const sembrar = (entidadTipo: 'pagina' | 'usuario' | 'rol', accion: 'publicar' | 'crear' | 'actualizar') =>
    AuditRepository.create({ entidadId: randomUUID(), entidadTipo, usuarioId, accion });

  // Se guardan los ids para limpiar exactamente lo sembrado y no rozar el
  // historial real de ese usuario.
  const sembradas = [
    await sembrar('pagina', 'publicar'),
    await sembrar('usuario', 'crear'),
    await sembrar('rol', 'actualizar'),
  ].map((fila) => fila.id);

  const todos = await AuditRepository.findAll(base);
  comprobar('filtra por usuario', todos.total, 3);

  comprobar('filtra por entidad', (await AuditRepository.findAll({ ...base, entidadTipo: 'usuario' })).total, 1);
  comprobar('filtra por acción', (await AuditRepository.findAll({ ...base, accion: 'actualizar' })).total, 1);

  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
  comprobar('un rango que las contiene las devuelve', (await AuditRepository.findAll({ ...base, hasta: manana })).total, 3);
  comprobar(
    'un rango pasado no devuelve nada',
    (await AuditRepository.findAll({ usuarioId, desde: new Date('2020-01-01'), hasta: new Date('2020-01-02') })).total,
    0
  );

  // El tope existe porque antes `?limit=1000000` era una petición válida contra la
  // tabla que más crece del sistema.
  comprobar('el límite tiene tope', (await AuditRepository.findAll({ ...base, porPagina: 99999 })).porPagina, MAX_POR_PAGINA);
  comprobar('una página cero se corrige a la primera', (await AuditRepository.findAll({ ...base, pagina: 0 })).pagina, 1);

  const primera = await AuditRepository.findAll({ ...base, porPagina: 2 });
  comprobar('parte en páginas', primera.totalPaginas, 2);
  comprobar('la primera página trae el tamaño pedido', primera.registros.length, 2);
  comprobar('la segunda trae el resto', (await AuditRepository.findAll({ ...base, porPagina: 2, pagina: 2 })).registros.length, 1);

  comprobar('ordena de lo más nuevo a lo más viejo', todos.registros[0]!.accion, 'actualizar');

  // El mapeo se comprueba contra una fila real y no solo contra el objeto de
  // juguete del bloque anterior: es lo que va a recibir la pantalla.
  const dto = aRegistroAuditoria(todos.registros[0]!.toJSON());
  comprobar('el DTO de una fila real trae el usuario', dto.usuarioId, usuarioId);
  comprobar('el DTO de una fila real trae la fecha en texto', typeof dto.fecha, 'string');

  await ContentAuditLog.destroy({ where: { id: sembradas } });
  comprobar('la limpieza no deja rastro', (await AuditRepository.findAll(base)).total, 0);
};

/**
 * El filtro `categoria` (SQL) y la etiqueta de cada fila (`categoriaDe`, en JS) salen de
 * la misma tabla de reglas, pero se aplican por dos caminos distintos. Esta prueba los
 * pone a discrepar contra la bitácora real: para cada categoría, las filas que devuelve
 * el filtro deben ser exactamente las que `categoriaDe` le asigna. Solo lee.
 */
const verificarCategorias = async () => {
  console.log('\n=== El filtro por categoría coincide con la regla de cada fila ===');

  const [pares] = (await sequelize.query(
    `SELECT entidad_tipo, accion, COUNT(*)::int AS n FROM auditoria_cambios WHERE id NOT IN (${SQL_IDS_GUARDADOS_AUTOMATICOS}) GROUP BY 1, 2`
  )) as [{ entidad_tipo: any; accion: any; n: number }[], unknown];

  const esperado = (categoria: string | null) =>
    pares.filter((p) => categoriaDe(p.accion, p.entidad_tipo) === categoria).reduce((suma, p) => suma + p.n, 0);

  for (const categoria of CATEGORIAS) {
    const { total } = await AuditRepository.findAll({ categoria, porPagina: 1 });
    comprobar(`«${categoria}» trae las filas que la regla le asigna`, total, esperado(categoria));
  }

  // Sin categoría en el filtro no se pierde nada: las tres más las que no encajan son todo.
  const suma = CATEGORIAS.reduce((s, c) => s + esperado(c), 0) + esperado(null);
  comprobar('las categorías más las sin categoría son toda la bitácora', suma, (await AuditRepository.findAll({ porPagina: 1 })).total);

  // Categoría y acción se suman con «y»: `actualizar` solo, de las dos categorías, no es
  // «Modificación» ni «Edición»; con la categoría sí lo es.
  const soloEdiciones = pares.filter((p) => p.accion === 'actualizar' && categoriaDe(p.accion, p.entidad_tipo) === 'editorial');
  comprobar(
    'categoría + acción: «actualizar» dentro de editorial',
    (await AuditRepository.findAll({ categoria: 'editorial', accion: 'actualizar', porPagina: 1 })).total,
    soloEdiciones.reduce((s, p) => s + p.n, 0)
  );
};

/** Ejecuta todas las comprobaciones de la bitácora y sale con código 1 si alguna falla. */
const main = async () => {
  verificarPermisos();
  verificarRedaccion();
  verificarUsuarioDeLaPeticion();
  verificarDto();
  verificarCategoriasPuras();

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
  await verificarClaveForanea();
  await verificarLectura();
  await verificarCategorias();
  await sequelize.close();

  console.log(fallos === 0 ? '\nTODO OK\n' : `\n${fallos} FALLOS\n`);
  process.exit(fallos === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error('\nLa verificación se interrumpió:', error);
  process.exit(1);
});
