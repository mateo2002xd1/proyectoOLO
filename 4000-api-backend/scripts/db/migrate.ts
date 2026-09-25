import 'dotenv/config';
import sequelize from '../../src/config/database';
import { aplicarPendientes, listarPendientes, revertirUltima } from '../../src/infrastructure/db/migrations';

const COMANDOS = ['up', 'status', 'down'] as const;
type Comando = (typeof COMANDOS)[number];

const ejecutar = async (comando: Comando): Promise<void> => {
  await sequelize.authenticate();

  if (comando === 'status') {
    const pendientes = await listarPendientes();
    if (pendientes.length === 0) {
      console.log('Sin migraciones pendientes.');
      return;
    }
    console.log(`Pendientes (${pendientes.length}):`);
    pendientes.forEach((nombre) => console.log(`  - ${nombre}`));
    return;
  }

  if (comando === 'down') {
    const revertida = await revertirUltima();
    console.log(revertida ? `Revertida: ${revertida}` : 'No hay nada que revertir.');
    return;
  }

  const aplicadas = await aplicarPendientes();
  console.log(
    aplicadas.length === 0
      ? 'Sin migraciones pendientes.'
      : `Aplicadas ${aplicadas.length}: ${aplicadas.join(', ')}`
  );
};

const comando = (process.argv[2] ?? 'up') as Comando;

if (!COMANDOS.includes(comando)) {
  console.error(`Comando desconocido: ${comando}. Usar uno de: ${COMANDOS.join(', ')}`);
  process.exit(1);
}

ejecutar(comando)
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
