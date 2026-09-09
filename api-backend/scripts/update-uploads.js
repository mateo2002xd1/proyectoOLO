const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  const res = await client.query(`UPDATE paginas SET contenido = REPLACE(contenido::text, '/upload/', '/uploads/')::jsonb WHERE contenido::text LIKE '%/upload/%'`);
  console.log('Updated ' + res.rowCount + ' rows in paginas');
  await client.end();
}

main().catch(console.error);
