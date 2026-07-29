import * as fs from 'fs';
import * as path from 'path';

/**
 * Genera un archivo SQL limpio con todo el esquema de base de datos.
 * Extrae las instrucciones SQL de las migraciones y las compila en un solo archivo.
 *
 * Uso: ts-node scripts/generar-esquema-sql.ts > esquema-completo.sql
 */

const migrationsDir = path.join(__dirname, '../src/infrastructure/db/migrations');

interface Migracion {
  nombre: string;
  contenido: string;
}

function extraerSQL(contenido: string): string[] {
  const regex = /sql\.query\s*\(\s*`([^`]+)`/g;
  const matches = [];
  let match;

  while ((match = regex.exec(contenido)) !== null) {
    matches.push(match[1].trim());
  }

  return matches;
}

function limpiarSQL(sql: string): string {
  // Elimina comillas de comillas escapadas en las migraciones
  return sql
    .replace(/\\n/g, '\n')
    .replace(/\\'/g, "'")
    .trim();
}

function obtenerMigraciones(): Migracion[] {
  const archivos = fs.readdirSync(migrationsDir)
    .filter(f => f.match(/^\d{3}-.*\.ts$/) && f !== 'index.ts')
    .sort();

  return archivos.map(archivo => {
    const contenido = fs.readFileSync(
      path.join(migrationsDir, archivo),
      'utf-8'
    );

    return {
      nombre: archivo,
      contenido
    };
  });
}

function generarEsquema(): void {
  const migraciones = obtenerMigraciones();

  console.log('-- ============================================================');
  console.log('-- ESQUEMA DE BASE DE DATOS - Observatorio Laboral (OLO)');
  console.log('-- Generado automáticamente desde las migraciones');
  console.log('-- ============================================================\n');

  for (const migracion of migraciones) {
    const [num, nombre] = migracion.nombre.replace('.ts', '').split('-');
    console.log(`\n-- ── Migración ${num}: ${nombre} ──────────────────────────`);

    const sqls = extraerSQL(migracion.contenido);
    for (const sql of sqls) {
      const limpio = limpiarSQL(sql);
      if (limpio && !limpio.includes('DO $$')) {
        // Omite bloques PL/pgSQL anidados, que suelen ser condicionales
        console.log(limpio + ';\n');
      } else if (limpio.includes('DO $$')) {
        console.log(limpio + '\n');
      }
    }
  }

  console.log('\n-- ── Fin del esquema ──────────────────────────────────────');
}

generarEsquema();
