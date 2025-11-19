const { v4: uuid } = require('uuid');
const { getPool, useDatabase } = require('../db/pool');

let ensureTablePromise = null;

async function ensureTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      if (!useDatabase) {
        return;
      }
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id UUID PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          topic TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    })().catch((error) => {
      ensureTablePromise = null;
      console.error('Error preparando tabla support_tickets', error);
      throw error;
    });
  }

  return ensureTablePromise;
}

async function listTickets() {
  if (!useDatabase) {
    return [];
  }

  await ensureTable();
  const pool = getPool();
  const { rows } = await pool.query(
    `
      SELECT
        id,
        full_name AS "fullName",
        email,
        topic,
        message,
        created_at AS "createdAt"
      FROM support_tickets
      ORDER BY created_at DESC
      LIMIT 100
    `
  );
  return rows;
}

async function createTicket(data) {
  await ensureTable();
  const pool = getPool();
  const ticket = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    ...data
  };

  await pool.query(
    `
      INSERT INTO support_tickets (id, full_name, email, topic, message, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [ticket.id, ticket.fullName, ticket.email, ticket.topic, ticket.message, ticket.createdAt]
  );

  return ticket;
}

module.exports = {
  useDatabase,
  listTickets,
  createTicket
};
