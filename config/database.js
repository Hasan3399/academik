const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // Railway provides DATABASE_URL for PostgreSQL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'siakad',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 10,
  });
}

// Wrap pool.query to return [rows, fields] so existing route code
// using `const [rows] = await db.query(...)` works without changes.
const query = async (text, params) => {
  const result = await pool.query(text, params);
  return [result.rows, result.fields];
};

module.exports = { query };
