import 'dotenv/config';
import sequelize from '../../src/config/database';
import { Role, User } from '../../src/infrastructure/db/models';
import { logAudit } from '../../src/use-cases/auditoria/audit.usecase';
import { esRolProtegido } from '../../src/shared/roles-protegidos';

/**
 * Retira un rol que ya no existe en el producto y decide qué pasa con las cuentas que aún lo
 * tienen. Pensado para `visitante_interno` (retirado el 2026-09-15, cuando se fusionaron los
 * roles de dirección), que un `deploy.sh sembrar` de antes del 2026-10-23 pudo volver a crear
 * en un servidor nuevo y que una base antigua puede tener asignado a alguien.
 *
 * **No decide por nadie.** Sin `--aplicar` solo informa (informe de lectura: nunca escribe).
 * Con cuentas asignadas hay que elegir una salida explícita, porque cada una es una decisión
 * de acceso distinta:
 *
 *   --reasignar-a=<rol>   pasa las cuentas a otro rol existente (no protegido). Es la salida
 *                         segura: nadie pierde la cuenta ni su historial.
 *   --inactivar-usuarios  deja las cuentas en `inactive`: no entran, pero siguen en la base con
 *                         todo lo que hicieron (la bitácora, RF-07, y la Ley 1581 piden poder
 *                         responder «quién hizo esto»). Una cuenta no puede quedarse sin rol
 *                         (`usuarios.rol_id` es obligatorio), así que **por sí sola no deja
 *                         borrar el rol**: inactiva y lo conserva, y lo dice. Combinada con
 *                         `--reasignar-a` las deja inactivas bajo ese otro rol y sí lo borra.
 *   --borrar-usuarios     las elimina. Solo si ninguna tiene nada a su nombre: si la base se lo
 *                         impide (un `created_by` apunta a ella) o la bitácora la nombra, se
 *                         niega y propone inactivar. Borrar a alguien que editó páginas deja
 *                         filas huérfanas.
 *
 * Todo ocurre en **una transacción**: o se hace entero o no se hace nada. Cada cuenta que
 * cambia deja su fila en la bitácora y el rol se borra al final (sus claves en
 * `roles_permisos` se van con él, `ON DELETE CASCADE`).
 *
 * Uso (desde el servidor):  ./docker/deploy.sh retirar-rol [opciones]
 * Directo:  npm run roles:retirar -- --rol=visitante_interno --reasignar-a=Editor --aplicar
 *
 * Los roles protegidos (`Superadmin`, `Administrador`, `Director/Subdirector`) nunca se
 * retiran desde aquí; tampoco se admite como destino de `--reasignar-a` uno protegido
 * distinto del que ya es el propio, para que un script de mantenimiento no pueda otorgar
 * acceso de administración a una cuenta.
 */

const ROL_POR_DEFECTO = 'visitante_interno';
const AUTOR = 'Mantenimiento (retirar-rol)';

interface Opciones {
  rol: string;
  reasignarA?: string;
  inactivar: boolean;
  borrar: boolean;
  aplicar: boolean;
}

const leerOpciones = (argv: string[]): Opciones => {
  const opciones: Opciones = { rol: ROL_POR_DEFECTO, inactivar: false, borrar: false, aplicar: false };
  for (const arg of argv) {
    if (arg === '--aplicar') opciones.aplicar = true;
    else if (arg === '--inactivar-usuarios') opciones.inactivar = true;
    else if (arg === '--borrar-usuarios') opciones.borrar = true;
    else if (arg.startsWith('--rol=')) opciones.rol = arg.slice('--rol='.length).trim();
    else if (arg.startsWith('--reasignar-a=')) opciones.reasignarA = arg.slice('--reasignar-a='.length).trim();
    else throw new Error(`Opción desconocida: ${arg}`);
  }
  if (opciones.borrar && (opciones.reasignarA || opciones.inactivar)) {
    throw new Error('--borrar-usuarios no se combina con las otras salidas. Solo --inactivar-usuarios y --reasignar-a van juntas.');
  }
  if (!opciones.rol) throw new Error('--rol no puede ir vacío.');
  return opciones;
};

const main = async (): Promise<void> => {
  const opciones = leerOpciones(process.argv.slice(2));
  await sequelize.authenticate();

  if (esRolProtegido(opciones.rol)) {
    throw new Error(`«${opciones.rol}» es un rol protegido del sistema: no se retira desde aquí.`);
  }

  const rol = await Role.findOne({ where: { name: opciones.rol } });
  if (!rol) {
    console.log(`El rol «${opciones.rol}» no existe en esta base. No hay nada que hacer.`);
    return;
  }
  const rolId = String(rol.get('id'));

  const cuentas = await User.findAll({ where: { role_id: rolId }, order: [['email', 'ASC']] });
  const [[{ permisos }]] = (await sequelize.query('SELECT COUNT(*)::int AS permisos FROM roles_permisos WHERE rol_id = :rolId', {
    replacements: { rolId },
  })) as unknown as [[{ permisos: number }]];

  console.log(`Rol «${opciones.rol}»: ${cuentas.length} cuenta(s) asignada(s), ${permisos} clave(s) de permiso.`);
  for (const cuenta of cuentas) {
    const c = cuenta as unknown as { email: string; status: string; last_access_at: Date | null };
    console.log(`  - ${c.email}  (${c.status}, último acceso: ${c.last_access_at ? new Date(c.last_access_at).toISOString() : 'nunca'})`);
  }

  const hayCuentas = cuentas.length > 0;
  const haySalida = Boolean(opciones.reasignarA) || opciones.inactivar || opciones.borrar;

  if (hayCuentas && !haySalida) {
    console.log(
      '\nHay cuentas con este rol. Elige qué hacer con ellas y vuelve a correrlo con --aplicar:\n' +
        '  --reasignar-a=<rol>    (lo seguro: conservan cuenta e historial)\n' +
        '  --inactivar-usuarios   (no entran, pero se conserva su historial)\n' +
        '  --borrar-usuarios      (solo si no tienen nada a su nombre)'
    );
    if (opciones.aplicar) process.exitCode = 1;
    return;
  }

  let destino: Role | null = null;
  if (opciones.reasignarA) {
    if (esRolProtegido(opciones.reasignarA)) {
      throw new Error(`No se reasigna a «${opciones.reasignarA}»: es un rol protegido y esto no otorga acceso de administración.`);
    }
    destino = await Role.findOne({ where: { name: opciones.reasignarA } });
    if (!destino) throw new Error(`El rol de destino «${opciones.reasignarA}» no existe.`);
  }

  if (!opciones.aplicar) {
    console.log('\nSimulación: no se cambió nada. Para aplicar, agrega --aplicar.');
    return;
  }

  // Si queda alguna cuenta apuntando al rol (solo inactivadas, sin destino), el rol no se puede borrar.
  const rolLiberado = Boolean(destino) || opciones.borrar || cuentas.length === 0;

  await sequelize.transaction(async (transaction) => {
    for (const cuenta of cuentas) {
      const c = cuenta as unknown as { id: string; email: string };

      if (destino || opciones.inactivar) {
        const cambios: { campo: string; antes: unknown; despues: unknown }[] = [];
        const nuevos: Record<string, string> = {};
        if (destino) {
          nuevos.role_id = String(destino.get('id'));
          cambios.push({ campo: 'rol', antes: opciones.rol, despues: opciones.reasignarA });
        }
        if (opciones.inactivar) {
          nuevos.status = 'inactive';
          cambios.push({ campo: 'status', antes: 'active', despues: 'inactive' });
        }
        await User.update(nuevos, { where: { id: c.id }, transaction });
        await logAudit(
          {
            entidadId: c.id,
            entidadTipo: 'usuario',
            usuarioNombre: AUTOR,
            accion: opciones.inactivar ? 'inactivar' : 'actualizar',
            camposModificados: cambios,
          },
          transaction
        );
      } else if (opciones.borrar) {
        const [[{ rastro }]] = (await sequelize.query(
          'SELECT COUNT(*)::int AS rastro FROM auditoria_cambios WHERE usuario_id = :id',
          { replacements: { id: c.id }, transaction }
        )) as unknown as [[{ rastro: number }]];
        if (rastro > 0) {
          throw new Error(
            `${c.email} figura en la bitácora (${rastro} registro/s). No se borra: usa --inactivar-usuarios para conservar su historial.`
          );
        }
        await User.destroy({ where: { id: c.id }, transaction });
        await logAudit(
          {
            entidadId: c.id,
            entidadTipo: 'usuario',
            usuarioNombre: AUTOR,
            accion: 'eliminar',
            camposModificados: [{ campo: 'email', antes: c.email, despues: null }],
          },
          transaction
        );
      }
    }

    // El rol solo se puede borrar si ninguna cuenta sigue apuntando a él.
    if (rolLiberado) await Role.destroy({ where: { id: rolId }, transaction });
  });

  const queHizo = [
    destino ? `pasadas a «${opciones.reasignarA}»` : '',
    opciones.inactivar ? 'inactivadas' : '',
    opciones.borrar ? 'eliminadas' : '',
  ]
    .filter(Boolean)
    .join(' e ');
  console.log(`\nListo: ${cuentas.length} cuenta(s) ${queHizo || 'sin cambios'}.`);
  console.log(
    rolLiberado
      ? `Rol «${opciones.rol}» eliminado.`
      : `El rol «${opciones.rol}» se CONSERVA: sus ${cuentas.length} cuenta(s) inactivas siguen apuntando a él (una cuenta no puede quedarse sin rol). ` +
          'Para borrarlo, vuelve a correrlo con --reasignar-a=<rol> --inactivar-usuarios --aplicar.'
  );
};

main()
  .catch((error: unknown) => {
    console.error(`\nERROR: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close().catch(() => undefined);
  });
