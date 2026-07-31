/**
 * Auditoría de `paginas.ambito` — solo lectura, no modifica nada.
 *
 * El slug es único por ámbito (uq_paginas_ambito_slug), pero durante un tiempo la
 * capa de aplicación ignoró `ambito`: buscaba por slug a secas y creaba páginas sin
 * fijarlo, con lo que todo caía en 'sitio'. Este script responde si eso dejó datos
 * mal clasificados antes de que la intranet empiece a escribir de verdad.
 */
import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../src/config/database';

type Fila = Record<string, unknown>;

const consultar = (sql: string) =>
  sequelize.query<Fila>(sql, { type: QueryTypes.SELECT, logging: false });

const imprimirTabla = (filas: Fila[], vacio: string) => {
  if (filas.length === 0) {
    console.log(`  ${vacio}`);
    return;
  }
  filas.forEach((fila) => console.log('  ', JSON.stringify(fila)));
};

const auditar = async (): Promise<void> => {
  await sequelize.authenticate();

  console.log('\n=== 1. Páginas por ámbito ===');
  imprimirTabla(
    await consultar(`
      SELECT ambito, COUNT(*)::int AS paginas
        FROM paginas
       GROUP BY ambito
       ORDER BY ambito;
    `),
    'La tabla paginas está vacía.'
  );

  console.log('\n=== 2. Inventario completo (slug, ámbito, versiones) ===');
  imprimirTabla(
    await consultar(`
      SELECT p.ambito,
             p.slug,
             p.titulo,
             (p.version_publicada_id IS NOT NULL) AS tiene_publicada,
             COUNT(pv.id)::int AS versiones
        FROM paginas p
        LEFT JOIN paginas_versiones pv ON pv.pagina_id = p.id
       GROUP BY p.id, p.ambito, p.slug, p.titulo, p.version_publicada_id
       ORDER BY p.ambito, p.slug;
    `),
    'Sin páginas registradas.'
  );

  // El riesgo concreto: un mismo slug existiendo en los dos ámbitos significa que
  // alguien ya los separó bien, o que hace falta separarlos. Si aparece repetido
  // solo dentro de 'sitio', es señal de que una página de intranet se guardó ahí.
  console.log('\n=== 3. Slugs presentes en más de un ámbito ===');
  imprimirTabla(
    await consultar(`
      SELECT slug, ARRAY_AGG(ambito ORDER BY ambito) AS ambitos
        FROM paginas
       GROUP BY slug
      HAVING COUNT(DISTINCT ambito) > 1
       ORDER BY slug;
    `),
    'Ningún slug está duplicado entre ámbitos.'
  );

  // Slugs que la intranet sirve hoy. Si alguno aparece con ambito='sitio', quedó
  // mal clasificado y hay que moverlo antes de que la intranet escriba sobre él.
  console.log('\n=== 4. Slugs de intranet guardados bajo ambito=\'sitio\' ===');
  imprimirTabla(
    await consultar(`
      SELECT slug, titulo, created_at
        FROM paginas
       WHERE ambito = 'sitio'
         AND slug IN ('inicio', 'tasa', 'matriz',
                      'encuestas/calidad-de-formacion', 'encuestas/seguimiento-laboral')
       ORDER BY slug;
    `),
    'Ninguno — nada que reclasificar.'
  );

  console.log('\n=== 5. Integridad del índice único (ambito, slug) ===');
  imprimirTabla(
    await consultar(`
      SELECT ambito, slug, COUNT(*)::int AS repeticiones
        FROM paginas
       GROUP BY ambito, slug
      HAVING COUNT(*) > 1;
    `),
    'Sin duplicados — el índice único se respeta.'
  );

  console.log('');
};

auditar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  });
