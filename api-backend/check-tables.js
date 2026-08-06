require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/olo'
});

client.connect().then(() => {
  return client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
}).then(res => {
  console.log('Tables:', res.rows.map(r => r.table_name));
  client.end();
}).catch(console.error);
