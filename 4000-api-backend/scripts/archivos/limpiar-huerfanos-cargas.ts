/**
 * Borra los Excel de `cargas-datos/` del filesystem que ya no referencia ninguna fila
 * de `archivos` — los que quedaron "quemados" en el disco.
 *
 * Aparecen porque la base de desarrollo es compartida (Neon) pero el filesystem es
 * de cada máquina: cuando alguien elimina una carga desde su equipo,
 * `eliminarArchivoSiQuedaSuelto` borra la fila para todos y el Excel solo de *su* disco.
 * En las demás máquinas el archivo se queda sin dueño para siempre, porque ya no hay
 * registro desde el que llegar a él. Lo mismo pasa con las cargas anteriores a que esa
 * limpieza existiera.
 *
 * Es el gemelo de `limpiar-huerfanos-uploads.ts`, que hace lo propio con los adjuntos de
 * páginas en `{ambito}/uploads/`.
 *
 * Corre en modo reporte (dry-run) por defecto. Pasa `--aplicar` para borrar de verdad:
 *
 *   npm run cargas:limpiar-huerfanos               # solo informa
 *   npm run cargas:limpiar-huerfanos -- --aplicar  # borra
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sequelize from '../../src/config/database';
import { Archivo } from '../../src/infrastructure/db/models';
import { directorioDeCargas, resolverRutaDeCarga } from '../../src/infrastructure/storage/filesystem';

const DIRECTORIO = directorioDeCargas();

/**
 * No se tocan aunque no tengan fila en `archivos`: el Excel que la API sigue leyendo por
 * su nombre mientras "Fuentes futuras de empleo" no tenga una carga en todos los
 * ambientes (ver `consultar-fuentes-futuras-actual.usecase.ts`). Cuando esa constante
 * desaparezca, esta lista queda vacía.
 */
const PROTEGIDOS = new Set(['fuentes-futuras-de-empleo.xlsx']);

const formatearBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

async function main() {
  const aplicar = process.argv.includes('--aplicar');

  if (!fs.existsSync(DIRECTORIO)) {
    console.log(`No existe ${DIRECTORIO}: no hay nada que limpiar.`);
    return;
  }

  const enDisco = fs.readdirSync(DIRECTORIO, { withFileTypes: true }).filter((e) => e.isFile());

  const filas = await Archivo.findAll({ attributes: ['id', 'nombreAlmacenado', 'rutaRelativa'] });
  const registrados = new Set(
    filas.map((fila) => path.basename(resolverRutaDeCarga(fila.get('rutaRelativa') as string)))
  );

  const huerfanos: { nombre: string; bytes: number }[] = [];
  let protegidos = 0;

  for (const entrada of enDisco) {
    if (registrados.has(entrada.name)) continue;
    if (PROTEGIDOS.has(entrada.name)) {
      protegidos++;
      continue;
    }
    huerfanos.push({ nombre: entrada.name, bytes: fs.statSync(path.join(DIRECTORIO, entrada.name)).size });
  }

  // El caso inverso no es basura: una fila cuyo Excel no está en este disco es una carga
  // hecha en otra máquina, y `guardar-excel-de-carga.ts` la reescribe al volver a subirla.
  const sinArchivo = filas.filter(
    (fila) => !fs.existsSync(resolverRutaDeCarga(fila.get('rutaRelativa') as string))
  ).length;

  console.log(`Carpeta:   ${DIRECTORIO}`);
  console.log(`En disco:  ${enDisco.length} archivo(s)`);
  console.log(`Con fila:  ${enDisco.length - huerfanos.length - protegidos}`);
  if (protegidos > 0) console.log(`Protegido: ${protegidos} (lista PROTEGIDOS)`);
  if (sinArchivo > 0) {
    console.log(`Avisos:    ${sinArchivo} fila(s) de 'archivos' sin su Excel aquí (cargas de otra máquina, normal).`);
  }
  console.log(`Huérfanos: ${huerfanos.length}\n`);

  if (huerfanos.length === 0) {
    console.log('Nada que borrar.');
    return;
  }

  for (const { nombre, bytes } of huerfanos) {
    console.log(`  ${aplicar ? 'borrando' : 'sobra   '}  ${nombre}  (${formatearBytes(bytes)})`);
    if (aplicar) fs.unlinkSync(path.join(DIRECTORIO, nombre));
  }

  const total = huerfanos.reduce((suma, h) => suma + h.bytes, 0);
  console.log(
    aplicar
      ? `\nBorrados ${huerfanos.length} archivo(s), ${formatearBytes(total)} liberados.`
      : `\nModo reporte: no se borró nada. Repite con --aplicar para liberar ${formatearBytes(total)}.`
  );
}

main()
  .catch((error) => {
    console.error('Error al limpiar las cargas huérfanas:', error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
