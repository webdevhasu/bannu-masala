const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

loadEnv();
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;`;
    console.log('✅ Added courier_name to orders table.');
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';`;
    console.log('Orders columns:', cols.map((c) => c.column_name));
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
