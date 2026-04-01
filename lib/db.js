import { neon } from '@neondatabase/serverless';

// Neon serverless PostgreSQL connection
const sql = neon(process.env.DATABASE_URL);

export default sql;
