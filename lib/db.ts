// db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://u55nenbuc8tput:p8527791571ff07ac1151b53bc99144bb5abd63902d8a628007ebbe0730eb2992@c3l5o0rb2a6o4l.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/deveidao82dcvl',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
