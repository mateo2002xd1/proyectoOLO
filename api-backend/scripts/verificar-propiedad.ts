/**
 * Comprueba la autorización a nivel de objeto (BOLA).
 *
 * Dos mitades independientes:
 *
 *  1. **Las policies contra los roles que hay de verdad en la tabla `roles`**, igual
 *     que `verificar-permisos.ts`. Los nombres están capitalizados en la base y las
 *     policies comparan en minúsculas; si alguien "arregla" esa normalización, aquí
 *     salta en vez de dejar a todo el mundo fuera —o dentro— en silencio.
 *
 *  2. **Un barrido de todas las rutas de Express**: ninguna ruta con parámetro de
 *     objeto (`:id`, `:slug`, `:contenidoId`…) puede llegar al controlador con solo
 *     `requireAuth`. Esta es la mitad que impide que el agujero vuelva a abrirse: era
 *     el estado de `/api/users/:id`, `/api/roles`, `/api/contenidos/:id` y compañía
 *     antes de esta tanda, y nada avisaba.
 *
 * Las rutas cuya comprobación de objeto vive en el caso de uso o en el controlador —y
 * no puede verse desde la cadena de middlewares— se declaran abajo con el motivo. Esa
 * lista es, de paso, el inventario de dónde está cada comprobación.
 *
 * No toca la base más que para leer `roles`.
 *
 * @see 3-seguridad-del-proyecto.md §S10
 */
import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../src/config/database';
import { app } from '../src/app';
import { usuariosPolicies } from '../src/policies/usuarios.policies';
import { contenidosPolicies } from '../src/policies/contenidos.policies';
import { detalleDeGuardia } from '../src/shared/autorizacion';

let fallos = 0;

const comprobar = (descripcion: string, obtenido: boolean, esperado: boolean) => {
  const ok = obtenido === esperado;
  if (!ok) fallos += 1;
  console.log(`  ${ok ? 'OK  ' : 'FALLA'}  ${descripcion} → ${obtenido} (esperado ${esperado})`);
};

// ---------------------------------------------------------------------------
// 1. Policies por rol
// ---------------------------------------------------------------------------

/** [administra usuarios, administra seguridad, edita contenido, elimina contenido] */
const ESPERADO: Record<string, [boolean, boolean, boolean, boolean]> = {
  Superadmin: [true, true, true, true],
  Administrador: [true, true, true, true],
  Editor: [false, false, true, false],
  Director: [false, false, false, false],
  Subdirector: [false, false, false, false],
  Visitante_interno: [false, false, false, false],
};

const verificarPolicies = async () => {
  const roles = await sequelize.query<{ nombre: string }>(
    'SELECT nombre FROM roles ORDER BY nombre;',
    { type: QueryTypes.SELECT, logging: false }
  );

  console.log('\n=== 1. Policies por rol (nombres tal cual están en la base) ===');
  for (const { nombre } of roles) {
    const esperado = ESPERADO[nombre];
    if (!esperado) {
      console.log(`  AVISO  rol '${nombre}' sin expectativa definida en esta prueba`);
      continue;
    }
    console.log(`\n  [${nombre}]`);
    comprobar('administra usuarios', usuariosPolicies.puedeAdministrarUsuarios(nombre), esperado[0]);
    comprobar('administra seguridad', usuariosPolicies.puedeAdministrarSeguridad(nombre), esperado[1]);
    comprobar('edita contenido', contenidosPolicies.puedeEditar(nombre), esperado[2]);
    comprobar('elimina contenido ajeno', contenidosPolicies.puedeEliminar(nombre), esperado[3]);
  }

  console.log('\n  [Casos límite]');
  comprobar('rol vacío no administra', usuariosPolicies.puedeAdministrarUsuarios(''), false);
  comprobar('rol nulo no administra', usuariosPolicies.puedeAdministrarUsuarios(null), false);
  comprobar('rol desconocido no edita', contenidosPolicies.puedeEditar('Invitado'), false);
  comprobar('admite espacios sobrantes', usuariosPolicies.puedeAdministrarUsuarios('  Administrador  '), true);
};

// ---------------------------------------------------------------------------
// 2. Barrido de rutas
// ---------------------------------------------------------------------------

/**
 * Rutas con parámetro de objeto cuya comprobación no está en la cadena de middlewares.
 * La clave es `MÉTODO ruta`; el valor, dónde vive la comprobación y qué hace.
 */
const COMPROBACION_FUERA_DE_LA_RUTA: Record<string, string> = {
  'GET /api/paginas/publica/:slug':
    'ruta pública por diseño (RF-10): solo devuelve la versión publicada',
  'GET /api/contenidos/:id':
    'obtenerContenidoPorId → 404 si no está publicado y no eres el autor ni puedes ver borradores',
  'GET /api/jobs/:id':
    'TrabajosController.consultarEstado → 404 si el job no es tuyo (dueño en job.data.usuarioId)',
  'GET /api/sections/:id':
    'la taxonomía es común a quien edita; no tiene dueño ni contenido reservado',
  'GET /api/audit-logs/:contentType/:contentId':
    'el router entero exige auditoriaPolicies.puedeVer antes de llegar aquí',
};

type Capa = {
  name?: string;
  handle?: any;
  route?: { path?: string; methods?: Record<string, boolean>; stack?: { handle?: any }[] };
  regexp?: RegExp;
  path?: string;
};

/** Reconstruye el prefijo con el que se montó un router a partir de su expresión. */
const prefijoDe = (capa: Capa): string => {
  if (typeof capa.path === 'string' && capa.path) return capa.path;

  const fuente = capa.regexp?.source ?? '';
  if (fuente === '^\\/?(?=\\/|$)') return '';

  return fuente
    .replace(/^\^/, '')
    .replace(/\\\/\?\(\?=\\\/\|\$\)$/, '')
    .replace(/\$$/, '')
    .replace(/\\\//g, '/')
    .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param');
};

type RutaHallada = { metodo: string; ruta: string; guardias: string[]; autenticada: boolean };

const recorrer = (capas: Capa[], prefijo: string, encontradas: RutaHallada[], heredados: any[]) => {
  const acumulados = [...heredados];

  for (const capa of capas) {
    if (capa.route) {
      const ruta = `${prefijo}${capa.route.path ?? ''}` || '/';
      const manejadores = [...acumulados, ...(capa.route.stack ?? []).map((s) => s.handle)];
      const metodos = Object.keys(capa.route.methods ?? {}).filter((m) => m !== '_all');

      for (const metodo of metodos) {
        encontradas.push({
          metodo: metodo.toUpperCase(),
          ruta,
          guardias: manejadores.map(detalleDeGuardia).filter((d): d is string => d !== null),
          autenticada: manejadores.some((h) => h?.name === 'requireAuth'),
        });
      }
      continue;
    }

    // `router.use(...)` de un sub-router: se baja con lo acumulado hasta aquí.
    if (capa.handle?.stack) {
      recorrer(capa.handle.stack, `${prefijo}${prefijoDe(capa)}`, encontradas, acumulados);
      continue;
    }

    // Middleware suelto montado con `use` sin ruta: aplica a todo lo que venga después.
    if (typeof capa.handle === 'function' && prefijoDe(capa) === '') {
      acumulados.push(capa.handle);
    }
  }
};

const TIENE_PARAMETRO = /:[A-Za-z]/;

const verificarRutas = () => {
  console.log('\n=== 2. Rutas con identificador de objeto ===');

  const raiz = (app as any).router ?? (app as any)._router;
  if (!raiz?.stack) {
    console.log('  FALLA  no se pudo leer el router de Express (¿cambió la versión?)');
    fallos += 1;
    return;
  }

  const encontradas: RutaHallada[] = [];
  recorrer(raiz.stack, '', encontradas, []);

  const conParametro = encontradas.filter((r) => TIENE_PARAMETRO.test(r.ruta));
  if (conParametro.length === 0) {
    console.log('  FALLA  no se encontró ninguna ruta con parámetro: el barrido no está mirando nada');
    fallos += 1;
    return;
  }

  const declaradas = new Set<string>();

  for (const { metodo, ruta, guardias, autenticada } of conParametro) {
    const clave = `${metodo} ${ruta}`;
    const excusa = COMPROBACION_FUERA_DE_LA_RUTA[clave];

    if (guardias.length > 0) {
      console.log(`  OK     ${clave} → ${guardias.join(', ')}`);
      continue;
    }

    if (excusa) {
      declaradas.add(clave);
      console.log(`  OK     ${clave} → ${excusa}`);
      continue;
    }

    fallos += 1;
    console.log(
      `  FALLA  ${clave} → ${autenticada ? 'solo requireAuth' : 'sin autenticación'}: ` +
        'sin guardia de autorización ni comprobación declarada'
    );
  }

  for (const clave of Object.keys(COMPROBACION_FUERA_DE_LA_RUTA)) {
    if (!declaradas.has(clave)) {
      console.log(`  AVISO  '${clave}' está declarada como excepción pero ya no existe o sí tiene guardia`);
    }
  }
};

const verificar = async (): Promise<void> => {
  await sequelize.authenticate();
  await verificarPolicies();
  verificarRutas();
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
