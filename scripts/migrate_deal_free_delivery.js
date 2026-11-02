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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
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
  console.log('Deal free delivery migration started...');

  await sql`
    ALTER TABLE hot_deals
    ADD COLUMN IF NOT EXISTS free_delivery BOOLEAN NOT NULL DEFAULT FALSE;
  `;
  console.log('Added free_delivery column to hot_deals.');

  await sql`
    ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS deal_id INTEGER;
  `;
  console.log('Added deal_id column to order_items.');

  await sql`
    ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS deal_name TEXT;
  `;
  console.log('Added deal_name column to order_items.');

  console.log('Deal free delivery migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
