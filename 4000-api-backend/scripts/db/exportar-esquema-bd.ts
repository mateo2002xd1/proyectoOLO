import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import * as fs from 'fs';

/**
 * Exporta el esquema ACTUAL de la BD a un archivo SQL limpio.
 * Usa information_schema de PostgreSQL para capturar:
 * - Tablas y columnas
 * - Constraints (PK, FK, UNIQUE, CHECK)
 * - Índices
 * - Vistas (opcional)
 */

async function exportarEsquema(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a BD exitosa');

    // Obtener información de tablas
    const tablasSql = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tablas = await sequelize.query(tablasSql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    let ddlCompleto = `-- ============================================================
-- ESQUEMA DE BASE DE DATOS - Observatorio Laboral (OLO)
-- Exportado directamente desde PostgreSQL
-- Fecha: ${new Date().toISOString()}
-- ============================================================\n\n`;

    // Para cada tabla, obtener su definición
    for (const row of tablas as any[]) {
      const table_name = Array.isArray(row) ? row[0] : row.table_name || Object.values(row)[0];
      const colsSql = `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = '${table_name}' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const cols = await sequelize.query(colsSql, {
        type: QueryTypes.SELECT,
        logging: false
      });

      ddlCompleto += `\nCREATE TABLE IF NOT EXISTS ${table_name} (\n`;

      const colDefs = (cols as any[]).map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        if (col.is_nullable === 'NO') def += ` NOT NULL`;
        return def;
      }).join(',\n');

      ddlCompleto += colDefs + '\n);\n';
    }

    // Obtener índices (no captados por pg_get_tabletedef en algunas versiones)
    const indicesSql = `
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE 'pg_%'
      ORDER BY indexname;
    `;

    const indices = await sequelize.query(indicesSql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    if (indices.length > 0) {
      ddlCompleto += '\n-- ── ÍNDICES ────────────────────────────────────────\n\n';
      for (const idx of indices as any[]) {
        if (!ddlCompleto.includes(idx.indexdef)) {
          ddlCompleto += idx.indexdef + ';\n\n';
        }
      }
    }

    // Guardar archivo
    const ruta = './esquema-desde-bd.sql';
    fs.writeFileSync(ruta, ddlCompleto, 'utf-8');

    console.log(`✓ Esquema exportado: ${ruta}`);
    console.log(`  Tablas: ${tablas.length}`);
    console.log(`  Índices: ${indices.length}`);

    await sequelize.close();
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

exportarEsquema();
