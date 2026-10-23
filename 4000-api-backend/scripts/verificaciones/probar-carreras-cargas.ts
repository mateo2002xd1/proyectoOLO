/**
 * Prueba de condiciones de carrera en las cargas de Excel del observatorio y en la
 * configuración del panel.
 *
 * `importarProgramasExcel` **vacía y recarga** `programas_sobresalientes` en una
 * transacción. En producción solo la cola (`heavy-jobs`, concurrencia global 1) debería
 * lanzarla, pero la cola no es la única defensa que hay que probar: aquí se llama al caso de
 * uso directamente, dos veces a la vez, para ver qué pasa si dos cargas llegan a correr
 * juntas (dos réplicas, un reintento de BullMQ, el script `probar-carga-observatorio`).
 * Lo correcto es que la tabla acabe siendo **exactamente** una de las dos cargas, no una
 * mezcla ni con filas duplicadas.
 *
 * También prueba `actualizarIdentidadPanel` (dos administradores cambian colores distintos
 * a la vez): no puede perderse ninguno de los dos cambios.
 *
 * Mismas reglas que los otros `probar-carreras-*.ts`: solo base local, ver `carreras-comun.ts`.
 *
 *   DATABASE_URL=postgres://postgres:prueba@localhost:55432/olo_prueba DB_SSL=false \
 *   REDIS_URL=redis://localhost:6390/0 \
 *   npx ts-node scripts/verificaciones/probar-carreras-cargas.ts [rondas]
 */
import { RONDAS, correrRondas, intentar, type Accion } from './carreras-comun';
import { libro, generar, type FilaExcel } from './carreras-excel';
import * as ExcelJS from 'exceljs';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import '../../src/infrastructure/db/models';
import { importarProgramasExcel } from '../../src/use-cases/observatorio/importar-programas-excel.usecase';
import {
  actualizarIdentidadPanel,
  subirImagenDeIdentidad,
  restablecerImagenDeIdentidad,
} from '../../src/use-cases/configuracion/identidad-panel.usecase';
import { importarAlertasInversionExcel } from '../../src/use-cases/alertas-inversion/importar-excel.usecase';
import { crearProyectoInversionManual } from '../../src/use-cases/alertas-inversion/crear-proyecto-manual.usecase';
import { directorioDeIdentidadDelPanel } from '../../src/infrastructure/storage/filesystem';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { procesarCargaTendencia } from '../../src/use-cases/observatorio/tendencia-ocupacional/procesar-carga-tendencia.usecase';
import { eliminarCargaTendencia } from '../../src/use-cases/observatorio/tendencia-ocupacional/eliminar-carga-tendencia.usecase';
import { TendenciaOcupacionalRepository } from '../../src/repositories/tendencia-ocupacional.repository';

const huella = async () =>
  (await sequelize.query<{ f: string }>(
    `SELECT string_agg(c.codigo || '/' || p.codigo || '/' || s.sexo || '/' || s.certificados, ',' ORDER BY c.codigo, p.codigo, s.sexo) AS f
       FROM programas_sobresalientes s
       JOIN centros_formacion c ON c.id = s.centro_id
       JOIN programas_formacion p ON p.id = s.programa_id`,
    { type: QueryTypes.SELECT }
  ))[0].f ?? '(vacía)';

const huellaDe = (filas: FilaExcel[]) =>
  filas
    .map((f) => ({ k: `${f.codCentro}/${f.codPrograma}/${f.sexo}/${f.certificados}`, c: f.codCentro, p: f.codPrograma, s: f.sexo }))
    .sort((a, b) => a.c - b.c || a.p - b.p || a.s.localeCompare(b.s))
    .map((x) => x.k)
    .join(',');

const vaciar = () =>
  sequelize.query(
    'DELETE FROM programas_sobresalientes; DELETE FROM programas_formacion; DELETE FROM centros_formacion; DELETE FROM niveles_formacion;'
  );

const colores = (fondo: string) => ({ fondo, texto: '#ffffff' });

/** Un PNG válido de 1×1 cuyo píxel depende de `semilla` (para que dos imágenes no sean idénticas). */
const png = (semilla: number): Buffer => {
  const crc = (buf: Buffer) => {
    let c = ~0;
    for (const b of buf) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const trozo = (tipo: string, datos: Buffer) => {
    const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const suma = Buffer.alloc(4);
    suma.writeUInt32BE(crc(cuerpo));
    return Buffer.concat([largo, cuerpo, suma]);
  };
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(1, 0);
  cabecera.writeUInt32BE(1, 4);
  cabecera[8] = 8;
  cabecera[9] = 2;
  const pixel = zlib.deflateSync(Buffer.from([0, semilla % 256, (semilla * 7) % 256, (semilla * 13) % 256]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', cabecera),
    trozo('IDAT', pixel),
    trozo('IEND', Buffer.alloc(0)),
  ]);
};

const archivosDeIdentidad = async () =>
  (await fs.readdir(directorioDeIdentidadDelPanel()).catch(() => [] as string[])).sort();

/** Un libro de alertas de inversión con una fila por elemento de `filas`. */
const libroAlertas = async (filas: { empresa: string; ciudad: string; fuente: string }[]): Promise<Buffer> => {
  const wb = new ExcelJS.Workbook();
  const hoja = wb.addWorksheet('Alertas');
  hoja.addRow(['Código', 'Actividad', 'Departamento', 'Ciudad', 'Empresa', 'Fecha', 'Fuente', 'Descripción', 'Tipo']);
  for (const f of filas) {
    hoja.addRow(['A', 'Agricultura', 'Antioquia', f.ciudad, f.empresa, '2026-01-15', f.fuente, 'Planta nueva', 'Nuevo']);
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
};

const main = async () => {
  await sequelize.authenticate();
  const veredictos: boolean[] = [];

  const A = generar(1, 3, 4);
  const B = generar(2, 3, 4);
  const [bufA, bufB] = [await libro(A), await libro(B)];
  const [hA, hB] = [huellaDe(A), huellaDe(B)];

  const importar = (n: string, buf: Buffer): Accion => ({ nombre: `cargar(${n})`, correr: () => importarProgramasExcel(buf) });

  veredictos.push(await correrRondas('Excel de programas: dos cargas DISTINTAS a la vez (A y B)', async () => {
    await vaciar();
    const rs = await Promise.all([importar('A', bufA), importar('B', bufB)].map(intentar));
    const h = await huella();
    const problemas: string[] = [];
    const filas = h === '(vacía)' ? 0 : h.split(',').length;
    if (h !== hA && h !== hB) problemas.push(`la tabla no es ni A ni B: tiene ${filas} filas (A=${A.length}, B=${B.length})`);
    return { rs, problemas, final: h === hA ? 'queda A' : h === hB ? 'queda B' : `MEZCLA/INCOMPLETA (${filas} filas)` };
  }));

  veredictos.push(await correrRondas('Excel de programas: la MISMA carga dos veces a la vez', async () => {
    await vaciar();
    const rs = await Promise.all([importar('A1', bufA), importar('A2', bufA)].map(intentar));
    const h = await huella();
    const problemas = h === hA ? [] : [`la tabla debía quedar como A (${A.length} filas) y quedó distinta`];
    return { rs, problemas, final: h === hA ? 'queda A' : `distinta (${h === '(vacía)' ? 0 : h.split(',').length} filas)` };
  }));

  veredictos.push(await correrRondas('Excel de programas: carga A con la tabla ya llena por B', async () => {
    await vaciar();
    await importarProgramasExcel(bufB);
    const rs = await Promise.all([importar('A', bufA), importar('A2', bufA)].map(intentar));
    const h = await huella();
    const problemas = h === hA ? [] : ['la tabla debía quedar como A y quedó distinta'];
    return { rs, problemas, final: h === hA ? 'queda A' : 'distinta' };
  }));

  /* ---- Configuración del panel ---- */

  veredictos.push(await correrRondas('identidad del panel: dos administradores cambian colores distintos a la vez', async () => {
    await sequelize.query("DELETE FROM configuracion WHERE clave = 'identidad-panel'");
    const ctx: any = { usuarioId: null, usuarioNombre: 'prueba', ip: null, userAgent: null };
    const rs = await Promise.all([
      intentar({ nombre: 'acciones', correr: () => actualizarIdentidadPanel({ acciones: { aprobar: colores('#112233') } }, null, ctx) }),
      intentar({ nombre: 'botones', correr: () => actualizarIdentidadPanel({ botones: { primario: colores('#445566') } }, null, ctx) }),
    ]);
    const [fila] = await sequelize.query<{ valor: any }>("SELECT valor FROM configuracion WHERE clave = 'identidad-panel'", { type: QueryTypes.SELECT });
    const v = fila?.valor ?? {};
    const tieneAcciones = !!v.acciones?.aprobar;
    const tieneBotones = !!v.botones?.primario;
    const problemas: string[] = [];
    if (!tieneAcciones || !tieneBotones) problemas.push(`se perdió un cambio: acciones=${tieneAcciones} botones=${tieneBotones}`);
    return { rs, problemas, final: `acciones=${tieneAcciones} botones=${tieneBotones}` };
  }));

  veredictos.push(await correrRondas('identidad del panel: lo mismo con la fila YA existente', async () => {
    const ctx: any = { usuarioId: null, usuarioNombre: 'prueba', ip: null, userAgent: null };
    await actualizarIdentidadPanel({ blancoEnModoOscuro: false }, null, ctx);
    const rs = await Promise.all([
      intentar({ nombre: 'acciones', correr: () => actualizarIdentidadPanel({ acciones: { aprobar: colores('#112233') } }, null, ctx) }),
      intentar({ nombre: 'botones', correr: () => actualizarIdentidadPanel({ botones: { primario: colores('#445566') } }, null, ctx) }),
    ]);
    const [fila] = await sequelize.query<{ valor: any }>("SELECT valor FROM configuracion WHERE clave = 'identidad-panel'", { type: QueryTypes.SELECT });
    const v = fila?.valor ?? {};
    const ok = !!v.acciones?.aprobar && !!v.botones?.primario;
    await sequelize.query("DELETE FROM configuracion WHERE clave = 'identidad-panel'");
    return { rs, problemas: ok ? [] : ['se perdió un cambio'], final: ok ? 'los dos' : 'FALTA UNO' };
  }));

  /* ---- Logo e icono del panel (escriben en disco) ---- */

  const ctx: any = { usuarioId: null, usuarioNombre: 'prueba', ip: null, userAgent: null };
  const limpiarIdentidad = async () => {
    await fs.rm(directorioDeIdentidadDelPanel(), { recursive: true, force: true });
    await sequelize.query("DELETE FROM configuracion WHERE clave = 'identidad-panel'");
  };
  const referenciados = async () => {
    const [fila] = await sequelize.query<{ valor: any }>(
      "SELECT valor FROM configuracion WHERE clave = 'identidad-panel'",
      { type: QueryTypes.SELECT }
    );
    return [fila?.valor?.logo, fila?.valor?.icono].filter(Boolean).sort() as string[];
  };
  const sinHuerfanos = async () => {
    const en = await archivosDeIdentidad();
    const ref = await referenciados();
    return { en, ref, ok: JSON.stringify(en) === JSON.stringify(ref) };
  };

  veredictos.push(await correrRondas('logo: dos imágenes distintas subidas a la vez (no puede quedar ninguna huérfana)', async () => {
    await limpiarIdentidad();
    const rs = await Promise.all([
      intentar({ nombre: 'subir(A)', correr: () => subirImagenDeIdentidad('logo', png(1), null, ctx) }),
      intentar({ nombre: 'subir(B)', correr: () => subirImagenDeIdentidad('logo', png(2), null, ctx) }),
    ]);
    const { en, ref, ok } = await sinHuerfanos();
    return {
      rs,
      problemas: ok && ref.length === 1 ? [] : [`archivos en disco ${en.length} ≠ referenciados ${ref.length}`],
      final: `${en.length} en disco, ${ref.length} referenciado(s)`,
    };
  }));

  veredictos.push(await correrRondas('logo e icono subidos a la vez (se guardan los dos)', async () => {
    await limpiarIdentidad();
    const rs = await Promise.all([
      intentar({ nombre: 'logo', correr: () => subirImagenDeIdentidad('logo', png(3), null, ctx) }),
      intentar({ nombre: 'icono', correr: () => subirImagenDeIdentidad('icono', png(4), null, ctx) }),
    ]);
    const { en, ref, ok } = await sinHuerfanos();
    return {
      rs,
      problemas: ok && ref.length === 2 ? [] : [`debían quedar logo e icono y quedan ${ref.length} referenciados / ${en.length} en disco`],
      final: `${en.length} en disco, ${ref.length} referenciado(s)`,
    };
  }));

  veredictos.push(await correrRondas('subir un logo a la vez que se restablece el de fábrica', async () => {
    await limpiarIdentidad();
    await subirImagenDeIdentidad('logo', png(5), null, ctx);
    const rs = await Promise.all([
      intentar({ nombre: 'subir', correr: () => subirImagenDeIdentidad('logo', png(6), null, ctx) }),
      intentar({ nombre: 'restablecer', correr: () => restablecerImagenDeIdentidad('logo', null, ctx) }),
    ]);
    const { en, ref, ok } = await sinHuerfanos();
    return {
      rs,
      problemas: ok ? [] : [`archivos en disco (${en.length}) y referenciados (${ref.length}) no coinciden`],
      final: `${en.length} en disco, ${ref.length} referenciado(s)`,
    };
  }));
  await limpiarIdentidad();

  /* ---- Alertas de inversión ---- */

  const vaciarAlertas = () =>
    sequelize.query('DELETE FROM proyectos_inversion; DELETE FROM empresas; DELETE FROM municipios;');
  const contarProyectos = async () =>
    Number((await sequelize.query<{ n: string }>('SELECT count(*) AS n FROM proyectos_inversion', { type: QueryTypes.SELECT }))[0].n);
  const filasDe = (prefijo: string, n: number) =>
    Array.from({ length: n }, (_, i) => ({
      empresa: `Empresa ${i % 3}`,
      ciudad: 'Medellín',
      fuente: `https://prueba.test/${prefijo}/${i}`,
    }));

  veredictos.push(await correrRondas('alertas de inversión: el MISMO Excel cargado dos veces a la vez (cada fuente, una sola vez)', async () => {
    await vaciarAlertas();
    const buf = await libroAlertas(filasDe('x', 6));
    const rs = await Promise.all(
      ['A', 'B'].map((n) => intentar({ nombre: `cargar(${n})`, correr: () => importarAlertasInversionExcel(buf, null) }))
    );
    const total = await contarProyectos();
    return { rs, problemas: total === 6 ? [] : [`debían quedar 6 proyectos y hay ${total}`], final: `${total} proyectos` };
  }));

  veredictos.push(await correrRondas('alertas de inversión: dos Excel distintos que comparten empresa y ciudad', async () => {
    await vaciarAlertas();
    const [a, b] = [await libroAlertas(filasDe('a', 4)), await libroAlertas(filasDe('b', 4))];
    const rs = await Promise.all([
      intentar({ nombre: 'cargar(A)', correr: () => importarAlertasInversionExcel(a, null) }),
      intentar({ nombre: 'cargar(B)', correr: () => importarAlertasInversionExcel(b, null) }),
    ]);
    const total = await contarProyectos();
    return { rs, problemas: total === 8 ? [] : [`debían quedar 8 proyectos y hay ${total}`], final: `${total} proyectos` };
  }));

  veredictos.push(await correrRondas('alertas de inversión: alta manual ×2 de la misma empresa y ciudad', async () => {
    await vaciarAlertas();
    const [seccion] = await sequelize.query<{ id: string }>('SELECT id FROM ciiu_secciones LIMIT 1', { type: QueryTypes.SELECT });
    const alta = (n: string): Accion => ({
      nombre: `alta(${n})`,
      correr: () =>
        crearProyectoInversionManual(
          {
            tipo: 'nuevo',
            descripcion: 'Planta',
            empresa: 'Empresa manual',
            departamento: 'Antioquia',
            ciudad: 'Rionegro',
            seccionId: seccion.id,
            claseId: null,
            fechaAnuncio: '2026-02-01',
            fuenteUrl: `https://prueba.test/manual/${n}`,
            fuenteMedio: null,
            inversionCop: null,
            empleosEstimados: null,
          } as any,
          null
        ),
    });
    const rs = await Promise.all([alta('A'), alta('B')].map(intentar));
    const total = await contarProyectos();
    return { rs, problemas: total === 2 ? [] : [`debían quedar 2 proyectos y hay ${total}`], final: `${total} proyectos` };
  }));
  await vaciarAlertas();

  /* ---- Tendencia ocupacional (la plantilla oficial como Excel de entrada) ---- */

  const plantilla = path.resolve(__dirname, '../../uploads/formatos-carga/formato-criterios-tendencias.xlsx');
  const libroPlantilla = new ExcelJS.Workbook();
  await libroPlantilla.xlsx.readFile(plantilla);
  // El catálogo de ocupaciones sale de la propia plantilla (hoja nacional): código, nombre y nivel.
  const vaciarTendencia = () =>
    sequelize.query(
      "DELETE FROM indicadores_ocupacionales; DELETE FROM cortes_ocupacionales; DELETE FROM cargas_datos WHERE modulo = 'tendencia_ocupacional';"
    );
  await vaciarTendencia();
  await sequelize.query('DELETE FROM ocupaciones');
  const nacional = libroPlantilla.getWorksheet('percentiles nacional')!;
  for (let r = 2; r <= nacional.rowCount; r++) {
    const fila = nacional.getRow(r);
    const codigo = String(fila.getCell(4).value ?? '').padStart(4, '0');
    if (!/^[0-9]{4}$/.test(codigo)) continue;
    await sequelize.query(
      'INSERT INTO ocupaciones (codigo, nombre, codigo_nc, nombre_vigencia) VALUES (:codigo, :nombre, :nc, 2025) ON CONFLICT DO NOTHING',
      { replacements: { codigo, nombre: String(fila.getCell(5).value ?? codigo).slice(0, 250), nc: Number(fila.getCell(2).value ?? 0) } }
    );
  }
  const [{ id: periodoId }] = await sequelize.query<{ id: string }>('SELECT id FROM periodos ORDER BY nombre LIMIT 1', { type: QueryTypes.SELECT });
  let anioDeLaPrueba = 2900;
  const nuevaCarga = (anio: number) =>
    TendenciaOcupacionalRepository.crearCarga({ archivoId: null as any, subidoPor: null, anio, periodoId });
  const cortesDeLaCelda = async (anio: number) =>
    Number((await sequelize.query<{ n: string }>(
      'SELECT count(*) AS n FROM cortes_ocupacionales WHERE anio = :anio AND periodo_id = :periodoId',
      { replacements: { anio, periodoId }, type: QueryTypes.SELECT }
    ))[0].n);
  const estadoDe = async (cargaId: string) =>
    (await sequelize.query<{ estado: string }>('SELECT estado FROM cargas_datos WHERE id = :cargaId', { replacements: { cargaId }, type: QueryTypes.SELECT }))[0]?.estado ?? 'borrada';
  const filasDeLaCelda = async (anio: number) =>
    Number((await sequelize.query<{ n: string }>(
      `SELECT count(*) AS n FROM indicadores_ocupacionales i JOIN cortes_ocupacionales c ON c.id = i.corte_id
        WHERE c.anio = :anio AND c.periodo_id = :periodoId`,
      { replacements: { anio, periodoId }, type: QueryTypes.SELECT }
    ))[0].n);

  // Control: una carga sola, para saber qué es «bien» con esta plantilla.
  const anioControl = anioDeLaPrueba++;
  const cargaControl = await nuevaCarga(anioControl);
  await procesarCargaTendencia(cargaControl, plantilla);
  const referenciaFilas = await filasDeLaCelda(anioControl);
  console.log(`\n(control de la tendencia: una carga sola deja estado «${await estadoDe(cargaControl)}» y ${referenciaFilas} indicadores)`);

  veredictos.push(await correrRondas('tendencia: dos cargas a la MISMA celda (año × periodo) a la vez', async () => {
    const anio = anioDeLaPrueba++;
    const [c1, c2] = [await nuevaCarga(anio), await nuevaCarga(anio)];
    const rs = await Promise.all([
      intentar({ nombre: 'procesar(1)', correr: () => procesarCargaTendencia(c1, plantilla) }),
      intentar({ nombre: 'procesar(2)', correr: () => procesarCargaTendencia(c2, plantilla) }),
    ]);
    const estados = [await estadoDe(c1), await estadoDe(c2)];
    const cortes = await cortesDeLaCelda(anio);
    const filas = await filasDeLaCelda(anio);
    const problemas: string[] = [];
    if (cortes !== 1) problemas.push(`la celda debía tener 1 corte y tiene ${cortes}`);
    if (filas !== referenciaFilas) problemas.push(`la celda debía tener ${referenciaFilas} indicadores y tiene ${filas}`);
    return { rs, problemas, final: `estados=${estados.sort().join('+')} cortes=${cortes} indicadores=${filas}` };
  }, Math.min(RONDAS, 5)));

  veredictos.push(await correrRondas('tendencia: eliminar la carga mientras se procesa', async () => {
    const anio = anioDeLaPrueba++;
    const c = await nuevaCarga(anio);
    const rs = await Promise.all([
      intentar({ nombre: 'procesar', correr: () => procesarCargaTendencia(c, plantilla) }),
      intentar({ nombre: 'eliminar', correr: () => eliminarCargaTendencia(c) }),
    ]);
    const cortes = await cortesDeLaCelda(anio);
    const filas = await filasDeLaCelda(anio);
    const estado = await estadoDe(c);
    const problemas: string[] = [];
    // Si la carga ya no existe, no puede quedar ningún dato suyo en la celda.
    if (estado === 'borrada' && (cortes > 0 || filas > 0)) problemas.push(`la carga se borró pero la celda conserva ${cortes} corte(s) y ${filas} indicador(es)`);
    return { rs, problemas, final: `carga=${estado} cortes=${cortes} indicadores=${filas}` };
  }, Math.min(RONDAS, 5)));

  await vaciarTendencia();
  await sequelize.query('DELETE FROM ocupaciones');
  await vaciar();
  const fallidos = veredictos.filter((v) => !v).length;
  console.log(`\n${fallidos === 0 ? 'TODO EN ORDEN' : `${fallidos} ESCENARIO(S) CON PROBLEMAS`} (${veredictos.length} escenarios)`);
  await sequelize.close();
  process.exit(fallidos === 0 ? 0 : 1);
};

main().catch(async (e) => {
  console.error(e);
  await sequelize.close().catch(() => undefined);
  process.exit(1);
});
