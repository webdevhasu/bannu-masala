const Database = require('better-sqlite3');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const localDb = new Database('bannu_masala.db');

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
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

loadEnvLocal();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Missing DATABASE_URL. Set it as an environment variable or add it to .env.local');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrateData() {
  console.log("Starting data migration from local SQLite to online Neon DB...");

  try {
    const products = localDb.prepare('SELECT * FROM products').all();
    
    if (products.length === 0) {
      console.log("No products found in local database.");
      return;
    }

    console.log(`Found ${products.length} products. Migrating...`);

    for (const p of products) {
      // Check if product already exists to avoid duplicates (based on slug)
      const existing = await sql`SELECT id FROM products WHERE slug = ${p.slug}`;
      if (existing.length > 0) {
        console.log(`⏩ Skipping '${p.name}', already exists in Neon.`);
        continue;
      }

      await sql`
        INSERT INTO products (name, slug, description, image, gallery, custom_variants, price_250g, price_500g, price_1kg)
        VALUES (${p.name}, ${p.slug}, ${p.description}, ${p.image}, ${p.gallery || '[]'}, ${p.custom_variants || '[]'}, ${p.price_250g}, ${p.price_500g}, ${p.price_1kg})
      `;
      console.log(`✅ Migrated: ${p.name}`);
    }

    console.log("Migration completed successfully! All products copied.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrateData();
