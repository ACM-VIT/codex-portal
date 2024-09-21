// lib/db.ts

import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pool: Pool | undefined;
}

let pool: Pool;

if (!global._pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Adjust this number as needed
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  if (process.env.NODE_ENV !== 'production') {
    global._pool = pool;
  }
} else {
  pool = global._pool;
}

export default pool;