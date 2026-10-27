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
  const { DEFAULT_SETTINGS } = await import('../lib/defaultSettings.mjs');

  console.log('Phase 1 migration started...');

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('Created site_settings table.');

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await sql`
      INSERT INTO site_settings (key, value)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;
  }
  console.log('Seeded default settings (existing values preserved).');

  const counts = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS products,
      (SELECT COUNT(*)::int FROM hot_deals) AS deals,
      (SELECT COUNT(*)::int FROM orders) AS orders,
      (SELECT COUNT(*)::int FROM reviews) AS reviews
  `;
  console.log('Current data:', counts[0]);

  console.log('Phase 1 migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
