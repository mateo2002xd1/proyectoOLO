import * as path from 'path';
import fs from 'fs';
import sequelize from '../src/config/database';
import { importarProgramasExcel } from '../src/use-cases/observatorio/importar-programas-excel.usecase';

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('Sincronizando modelos...');
    await sequelize.sync();

    const testFilePath = path.join(__dirname, '../../sitio-web/public/storage/uploads/excel/Programas sobresalientes por sexo y por regiones - copia.xlsx');
    console.log(`Iniciando importación leyendo en memoria desde: ${testFilePath}`);
    
    const fileBuffer = fs.readFileSync(testFilePath);
    const result = await importarProgramasExcel(fileBuffer);

    console.log('\n--- RESULTADO DE IMPORTACIÓN ---');
    console.log(`Éxito: ${result.exito}`);
    console.log(`Mensaje: ${result.mensaje}`);
    console.log('Estadísticas:');
    console.table(result.estadisticas);
    console.log('--------------------------------\n');

  } catch (error) {
    console.error('Error durante la importación:', error);
  } finally {
    await sequelize.close();
  }
}

main();
