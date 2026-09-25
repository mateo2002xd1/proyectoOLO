import { QueryInterface } from 'sequelize';

export const nombre = '027-cargas-datos';

/**
 * Registro de cada carga masiva de datos hecha desde la sección "Actualizaciones"
 * del panel de administración (antes "Soporte", sin uso real).
 *
 * No depende de `026-observatorio-programas-sobresalientes` a nivel de esquema —
 * es pura auditoría (quién subió, cuándo, con qué resultado), sin FK hacia
 * `programas_sobresalientes`. La carga de esa tabla es "vaciar y recargar" completo
 * (ver `use-cases/observatorio/importar-programas-excel.usecase.ts`), así que no
 * hay "versión vigente" que enlazar por fila — solo el hecho de que una carga
 * ocurrió y cómo salió.
 *
 * `modulo` distingue de qué tarjeta de "Actualizaciones" viene la carga (hoy solo
 * `programa_sobresalientes`; las otras tres tarjetas — Alertas de inversión,
 * Fuentes futuras de empleo, Criterios de clasificación de resultados — siguen sin
 * Excel ni esquema especificado, quedan como "Próximamente").
 *
 * Sin estado de aprobación: solo sube el Administrador y se procesa de inmediato
 * (decisión de sesión — se descartó el flujo editor-sube/admin-aprueba).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS cargas_datos (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      modulo            VARCHAR NOT NULL DEFAULT 'programa_sobresalientes',
      archivo_id        UUID REFERENCES archivos(id) ON DELETE SET NULL,
      estado            VARCHAR NOT NULL DEFAULT 'procesando'
                          CHECK (estado IN ('procesando', 'completado', 'error')),
      filas_procesadas  INTEGER NOT NULL DEFAULT 0,
      mensaje           TEXT,
      subido_por        UUID REFERENCES usuarios(id) ON DELETE SET NULL,
      creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
      completado_en     TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_cargas_datos_modulo_estado
      ON cargas_datos(modulo, estado, creado_en DESC);
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS cargas_datos;');
}
