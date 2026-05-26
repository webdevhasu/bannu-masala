const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  let envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    envPath = path.join(process.cwd(), '.env');
  }
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // Strip quotes if present
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

loadEnvLocal();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Missing DATABASE_URL. Set it as an environment variable or add it to .env.local');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  console.log("Starting Neon database migration for 'hot_deals'...");

  try {
    // Create Hot Deals Table
    await sql`
      CREATE TABLE IF NOT EXISTS hot_deals (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image TEXT,
        price INTEGER DEFAULT 0,
        original_price INTEGER DEFAULT 0,
        link TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Created 'hot_deals' table.");
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
