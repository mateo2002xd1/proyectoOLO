require('ts-node').register({ transpileOnly: true });

const sequelize = require('../src/config/database').default;

async function main() {
  try {
    await sequelize.authenticate();
    const [results, metadata] = await sequelize.query(`UPDATE archivos SET ruta_relativa = REPLACE(ruta_relativa, '/upload/', '/uploads/') WHERE ruta_relativa LIKE '%/upload/%'`);
    console.log('Update query successful, rows affected:', metadata.rowCount || results.rowCount || 0);
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await sequelize.close();
  }
}

main();
