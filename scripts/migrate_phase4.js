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
  console.log('Phase 4 migration started...');

  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('Created contact_messages table.');

  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark TEXT;`;
  console.log('Added payment method and landmark fields to orders.');

  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);`;

  const counts = await sql`SELECT COUNT(*)::int AS total FROM contact_messages`;
  console.log('Contact messages:', counts[0].total);

  console.log('Phase 4 migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
