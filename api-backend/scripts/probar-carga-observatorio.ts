import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sequelize from '../src/config/database';
import '../src/infrastructure/db/models';
import { importarProgramasExcel } from '../src/use-cases/observatorio/importar-programas-excel.usecase';

/**
 * Prueba manual de la carga de "Programa + Sobresalientes" (observatorio) sin
 * pasar por HTTP ni por la cola de BullMQ — llama directo al use-case de
 * importación, igual de transaccional, para poder revisar rápido
 * (Criterio 5 de `plan-programa-sobresalientes.md`):
 *
 *   - Un Excel con una columna faltante falla con mensaje claro, sin tocar
 *     `programas_sobresalientes`.
 *   - Un Excel con varios centros por departamento y varios programas por nivel
 *     (el caso real de "Superan el margen") se carga sin error.
 *
 * No hay test runner en este proyecto (sin Jest/Vitest instalado): las otras
 * herramientas de `scripts/` ya siguen este mismo patrón de CLI manual
 * (`probar-versionamiento.ts`).
 *
 * Uso: npx ts-node scripts/probar-carga-observatorio.ts <ruta-al-excel.xlsx>
 */
async function main() {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error('Uso: npx ts-node scripts/probar-carga-observatorio.ts <ruta-al-excel.xlsx>');
    process.exit(1);
  }

  await sequelize.authenticate();

  const datos = fs.readFileSync(path.resolve(ruta));
  console.log(`Procesando "${ruta}"...\n`);

  const resultado = await importarProgramasExcel(datos);

  console.log('Resultado:');
  console.table([resultado.estadisticas]);
  console.log(resultado.mensaje);

  await sequelize.close();
}

main().catch((err) => {
  console.error('Falló la carga:', err instanceof Error ? err.message : err);
  process.exit(1);
});
