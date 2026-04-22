import { neon, Pool } from '@neondatabase/serverless';

// Neon serverless PostgreSQL connection (Stateless for simple queries)
export const sql = neon(process.env.DATABASE_URL);

// Pooled connection for transactions
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default sql;
