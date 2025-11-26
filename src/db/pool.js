const { Pool } = require('pg');

const databaseName = process.env.DB_NAME || process.env.DB_DATABASE;
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_PORT'];
const hasAllVars = requiredVars.every((key) => Boolean(process.env[key])) && Boolean(databaseName);

const useDatabase = hasAllVars;
let pool;

function parseBoolean(value) {
  if (value === undefined || value === null) return false;
  return ['1', 'true', 'yes', 'on', 'require'].includes(String(value).toLowerCase());
}

function getSSLConfig() {
  const sslMode = String(process.env.DB_SSLMODE || '').toLowerCase();
  const sslEnabled = parseBoolean(process.env.DB_SSL) || sslMode === 'require';
  return sslEnabled ? { rejectUnauthorized: false } : undefined;
}

function getPool() {
  if (!useDatabase) {
    throw new Error('Base de datos no configurada (faltan variables de entorno)');
  }

  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: databaseName,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: getSSLConfig()
    });
  }

  return pool;
}

module.exports = {
  useDatabase,
  getPool
};
