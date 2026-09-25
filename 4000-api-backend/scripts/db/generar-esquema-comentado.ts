import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import * as fs from 'fs';

/**
 * Genera esquema SQL con comentarios explicativos de cada tabla.
 * Lee los comentarios de PostgreSQL y agrega documentación adicional.
 */

const comentariosTablas: Record<string, string> = {
  usuarios: 'Usuarios administradores del sistema con control de acceso basado en roles',
  roles: 'Definición de roles de acceso (administrador, editor, etc.)',
  permissions: 'Permisos granulares del sistema (acceso.sitio, acceso.intranet)',
  role_permissions: 'Relación muchos-a-muchos entre roles y permisos',
  paginas: 'Páginas publicables del sitio e intranet con versionado',
  paginas_versiones: 'Historial de versiones de páginas con estados (borrador, revisión, publicado)',
  contenidos: 'Artículos y posts publicables con metadatos SEO',
  contenidos_archivos: 'Asociación entre contenidos y archivos (adjuntos, portadas, galerías)',
  archivos: 'Almacenamiento centralizado de archivos con validación de integridad (SHA-256)',
  archivos_metadatos: 'Información adicional y análisis de archivos',
  configuraciones: 'Configuración del sistema editable (tamaño máximo de archivos, dominios permitidos)',
  marca_versiones: 'Versiones de identidad visual con tokens de diseño (colores, logos)',
  tableros_bi: 'Referencias a tableros Power BI embebidos en páginas',
  politicas_privacidad: 'Políticas de privacidad versionadas (Habeas Data - Ley 1581/2012)',
  consentimientos: 'Registro de aceptaciones de políticas de privacidad (cumplimiento normativo)',
  notificaciones: 'Avisos del sistema para usuarios (cambios, rechazos, tareas)',
  auditoria_accesos: 'Registro de descargas y visualizaciones de archivos y páginas',
  auditoria_cambios: 'Historial de cambios en contenidos con quién y cuándo',
  respaldos: 'Registro de respaldos automáticos y manuales de la BD',
  security_questions: 'Preguntas de seguridad personalizadas para autenticación multifactor',
  consentimiento: 'Consentimientos para procesamiento de datos',
  "Section": 'Secciones de contenido heredadas (migración pendiente)',
  "Post": 'Posts heredados de versión anterior (migración pendiente)',
  "Attachment": 'Adjuntos heredados de versión anterior (migración pendiente)',
  FileStatuses: 'Estados de revisión de archivos subidos',
  _obsoleto_attachment: 'Tabla obsoleta - usar archivos en lugar de esta'
};

async function generarEsquemaComentado(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✓ Conectado a BD');

    // Obtener todas las tablas
    const tablasSql = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tablas = await sequelize.query(tablasSql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    let sql = `-- ============================================================
-- ESQUEMA DE BASE DE DATOS - Observatorio Laboral (OLO)
-- Exportado directamente desde PostgreSQL
-- Fecha: ${new Date().toLocaleString('es-CO')}
-- ============================================================

-- Este archivo documenta la estructura de la base de datos,
-- incluyendo propósito de cada tabla y relaciones.

`;

    // Procesar cada tabla
    for (const row of tablas as any[]) {
      const table_name = Array.isArray(row) ? row[0] : row.table_name || Object.values(row)[0];

      // Agregar comentario descriptivo
      const comentario = comentariosTablas[table_name] || 'Tabla sin documentación';
      sql += `\n-- ── ${table_name.toUpperCase()} ────────────────────────────────────\n`;
      sql += `-- ${comentario}\n`;

      // Obtener columnas
      const colsSql = `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_name = '${table_name}' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const cols = await sequelize.query(colsSql, {
        type: QueryTypes.SELECT,
        logging: false
      });

      sql += `CREATE TABLE IF NOT EXISTS ${table_name} (\n`;

      const colDefs = (cols as any[]).map((col, idx) => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        if (col.is_nullable === 'NO') {
          def += ` NOT NULL`;
        }
        return def + (idx < cols.length - 1 ? ',' : '');
      }).join('\n');

      sql += colDefs + '\n);\n';

      // Agregar comentarios de columnas
      const comentariosCols = obtenerComentariosColumnas(table_name);
      if (comentariosCols.length > 0) {
        sql += `\n-- Columnas:\n`;
        comentariosCols.forEach(c => {
          sql += `-- • ${c.columna}: ${c.descripcion}\n`;
        });
      }
    }

    // Obtener y agregar constraints
    sql += `\n\n-- ════════════════════════════════════════════════════════════\n`;
    sql += `-- CONSTRAINTS Y RELACIONES\n`;
    sql += `-- ════════════════════════════════════════════════════════════\n`;

    const constraintsSql = `
      SELECT
        table_name,
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      ORDER BY table_name, constraint_type DESC;
    `;

    const constraints = await sequelize.query(constraintsSql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    let ultimaTabla = '';
    for (const c of constraints as any[]) {
      const tn = Array.isArray(c) ? c[0] : c.table_name || Object.values(c)[0];
      if (tn !== ultimaTabla) {
        sql += `\n-- ${tn}:\n`;
        ultimaTabla = tn;
      }
      const cn = Array.isArray(c) ? c[1] : c.constraint_name || Object.values(c)[1];
      const ct = Array.isArray(c) ? c[2] : c.constraint_type || Object.values(c)[2];
      sql += `--   • ${cn} (${ct})\n`;
    }

    // Guardar archivo
    const ruta = './esquema-comentado.sql';
    fs.writeFileSync(ruta, sql, 'utf-8');

    console.log(`✓ Esquema comentado generado: ${ruta}`);
    console.log(`  Tablas documentadas: ${tablas.length}`);
    console.log(`  Constraints: ${constraints.length}`);

    await sequelize.close();
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

function obtenerComentariosColumnas(tabla: string): Array<{columna: string; descripcion: string}> {
  const comentarios: Record<string, Array<{columna: string; descripcion: string}>> = {
    usuarios: [
      { columna: 'id', descripcion: 'Identificador único (UUID)' },
      { columna: 'nombre', descripcion: 'Nombre completo del usuario' },
      { columna: 'email', descripcion: 'Email único para login' },
      { columna: 'rol_id', descripcion: 'FK a roles - determina permisos' },
      { columna: 'estado', descripcion: 'active/inactive/locked' },
      { columna: 'fecha_caducidad', descripcion: 'Fecha de vencimiento de la cuenta (NULL = sin vencimiento)' },
      { columna: 'ultimo_acceso_en', descripcion: 'Última vez que inició sesión' },
      { columna: 'debe_cambiar_password', descripcion: 'Flag para forzar cambio de contraseña al siguiente login' }
    ],
    paginas: [
      { columna: 'id', descripcion: 'Identificador único' },
      { columna: 'slug', descripcion: 'URL amigable (único por ámbito)' },
      { columna: 'titulo', descripcion: 'Título visible' },
      { columna: 'version_publicada_id', descripcion: 'FK a paginas_versiones - qué versión está en vivo' },
      { columna: 'creado_por', descripcion: 'FK a usuarios - quién creó la página' },
      { columna: 'ambito', descripcion: 'sitio o intranet - dónde se publica' }
    ],
    archivos: [
      { columna: 'id', descripcion: 'Identificador único' },
      { columna: 'hash_sha256', descripcion: 'Checksum para validar integridad y detectar duplicados' },
      { columna: 'tamano_bytes', descripcion: 'Tamaño verificado en servidor (RF-02)' },
      { columna: 'ambito', descripcion: 'publico o interno - controla visibilidad' },
      { columna: 'estado', descripcion: 'pendiente/disponible/rechazado/eliminado' },
      { columna: 'texto_alternativo', descripcion: 'Descripción para accesibilidad (WCAG)' }
    ],
    consentimientos: [
      { columna: 'id', descripcion: 'Identificador único' },
      { columna: 'politica_id', descripcion: 'FK a politicas_privacidad - NO BORRABLE (prueba legal)' },
      { columna: 'aceptado', descripcion: 'Solo true - registra aceptación explícita, nunca casilla premarcada' },
      { columna: 'ip', descripcion: 'IP del usuario para auditoría' },
      { columna: 'user_agent', descripcion: 'Navegador/dispositivo para auditoría' }
    ],
    respaldos: [
      { columna: 'id', descripcion: 'Identificador único' },
      { columna: 'estado', descripcion: 'en_curso/exitoso/fallido' },
      { columna: 'retencion_hasta', descripcion: 'Cuándo se puede borrar este respaldo (RF-17)' },
      { columna: 'cifrado', descripcion: 'Si el respaldo está encriptado' },
      { columna: 'error', descripcion: 'Mensaje de error si falló' }
    ]
  };

  return comentarios[tabla] || [];
}

generarEsquemaComentado();
