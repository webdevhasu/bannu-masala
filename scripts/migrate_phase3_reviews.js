const fs = require('fs');
const path = require('path');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const envPath = path.join(process.cwd(), file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) process.env[key] = value;
    }
  }
}

loadEnv();

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Review/order migration started...');

  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;`;
  await sql`ALTER TABLE reviews ALTER COLUMN is_approved SET DEFAULT false;`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_phone TEXT;`;
  console.log('Added review approval and verified-purchase fields.');

  await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id INTEGER;`;
  console.log('Added product_id to order_items.');

  const reviews = await sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_approved)::int AS approved FROM reviews`;
  console.log('Review status:', reviews[0]);

  console.log('Review/order migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
