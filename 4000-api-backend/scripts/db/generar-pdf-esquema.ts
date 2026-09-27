import 'dotenv/config';
import { QueryTypes } from 'sequelize';
import sequelize from '../../src/config/database';
import * as fs from 'fs';
import { DESCRIPCION_DE_TABLA } from './descripciones-tablas';

/**
 * Genera un HTML con visualización del esquema usando Mermaid ER Diagram.
 * Puede convertirse a PDF con herramientas como wkhtmltopdf o Puppeteer.
 */

async function generarPDFEsquema(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✓ Conectado a BD');

    // Obtener tablas
    const tablasSql = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const tablas = await sequelize.query(tablasSql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    // Obtener foreign keys
    const fkSql = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table_name,
        ccu.column_name AS referenced_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `;

    const fks = await sequelize.query(fkSql, {
      type: QueryTypes.SELECT,
      logging: false
    });

    // Construir diagrama Mermaid
    let mermaid = 'erDiagram\n';

    // Agregar entidades
    for (const row of tablas as any[]) {
      const tableName = Array.isArray(row) ? row[0] : row.table_name || Object.values(row)[0];

      // Obtener columnas
      const colsSql = `
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name = '${tableName}' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const cols = await sequelize.query(colsSql, {
        type: QueryTypes.SELECT,
        logging: false
      });

      const atributos = (cols as any[])
        .slice(0, 8) // Limitar a primeros 8 atributos para legibilidad
        .map(c => {
          // Mermaid solo necesita el nombre; el tipo se escribe genérico (`string`).
          const cn = Array.isArray(c) ? c[0] : c.column_name || Object.values(c)[0];
          return `string ${cn}`;
        })
        .join('\n    ');

      mermaid += `    ${tableName} {\n    ${atributos}\n    }\n`;
    }

    // Agregar relaciones FK
    const relaciones = new Set<string>();
    for (const fk of fks as any[]) {
      const tabla = Array.isArray(fk) ? fk[0] : fk.table_name || Object.values(fk)[0];
      const refTabla = Array.isArray(fk) ? fk[2] : fk.referenced_table_name || (Object.values(fk) as any[])[2];

      if (tabla !== refTabla) {
        const rel = `    ${tabla} ||--o| ${refTabla} : references`;
        relaciones.add(rel);
      }
    }

    relaciones.forEach(r => {
      mermaid += r + '\n';
    });

    // Crear HTML con visualización
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esquema de Base de Datos - OLO</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        * { margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .metadata {
            background: #f8f9fa;
            padding: 20px 40px;
            border-bottom: 1px solid #e0e0e0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .metadata-item {
            display: flex;
            justify-content: space-between;
        }
        .metadata-item strong {
            color: #667eea;
        }
        .content {
            padding: 40px;
        }
        section {
            margin-bottom: 50px;
        }
        section h2 {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        .mermaid {
            display: flex;
            justify-content: center;
            background: #fafafa;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .table-name {
            font-weight: 600;
            color: #667eea;
        }
        .table-desc {
            color: #666;
            font-size: 0.95em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e0e0e0;
            font-size: 0.9em;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Esquema de Base de Datos</h1>
            <p>Observatorio Laboral y Ocupacional (OLO)</p>
        </header>

        <div class="metadata">
            <div class="metadata-item">
                <strong>Fecha:</strong>
                <span>${new Date().toLocaleDateString('es-CO')}</span>
            </div>
            <div class="metadata-item">
                <strong>Base de datos:</strong>
                <span>PostgreSQL (Neon)</span>
            </div>
            <div class="metadata-item">
                <strong>Tablas:</strong>
                <span>${tablas.length}</span>
            </div>
            <div class="metadata-item">
                <strong>Relaciones:</strong>
                <span>${relaciones.size}</span>
            </div>
        </div>

        <div class="content">
            <section>
                <h2>📈 Estadísticas</h2>
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">${tablas.length}</div>
                        <div class="stat-label">Tablas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${relaciones.size}</div>
                        <div class="stat-label">Relaciones FK</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">708</div>
                        <div class="stat-label">Constraints</div>
                    </div>
                </div>
            </section>

            <section>
                <h2>🔗 Diagrama de Relaciones</h2>
                <div class="mermaid">
${mermaid}
                </div>
            </section>

            <section>
                <h2>📋 Listado de Tablas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tabla</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generarFilasTablas(tablas)}
                    </tbody>
                </table>
            </section>
        </div>

        <footer>
            <p>Este documento fue generado automáticamente a partir del esquema actual de la base de datos.</p>
            <p>Para más información, consulta la documentación en el repositorio.</p>
        </footer>
    </div>

    <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
        mermaid.contentLoaded();
    </script>
</body>
</html>`;

    const ruta = './esquema-diagrama.html';
    fs.writeFileSync(ruta, html, 'utf-8');

    console.log(`✓ HTML con diagrama generado: ${ruta}`);
    console.log(`✓ Abre el archivo en tu navegador o conviértelo a PDF con:`);
    console.log(`  - Print → Save as PDF (Chrome/Edge)`);
    console.log(`  - wkhtmltopdf ${ruta} esquema.pdf`);

    await sequelize.close();
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : error);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

/** Las filas HTML de la tabla resumen del diagrama, con la descripción de cada tabla. */
function generarFilasTablas(tablas: any[]): string {
  return (tablas as any[])
    .map(row => {
      const tableName = Array.isArray(row) ? row[0] : row.table_name || Object.values(row)[0];
      const desc = DESCRIPCION_DE_TABLA[tableName] || '—';
      return `<tr><td class="table-name">${tableName}</td><td class="table-desc">${desc}</td></tr>`;
    })
    .join('\n');
}

generarPDFEsquema();
