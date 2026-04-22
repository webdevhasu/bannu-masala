const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

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
  console.log("Starting Neon database migration...");

  try {
    // 1. Create Products Table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        gallery TEXT DEFAULT '[]',
        custom_variants TEXT DEFAULT '[]',
        price_250g INTEGER DEFAULT 0,
        price_500g INTEGER DEFAULT 0,
        price_1kg INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Created 'products' table.");

    // Ensure new columns exist for older deployments
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT DEFAULT '[]';`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_variants TEXT DEFAULT '[]';`;

    // 2. Create Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT,
        phone TEXT,
        city TEXT,
        address TEXT,
        subtotal INTEGER,
        shipping INTEGER,
        total INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Created 'orders' table.");

    // 3. Create Order Items Table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_name TEXT,
        variant TEXT,
        quantity INTEGER,
        price INTEGER
      );
    `;
    console.log("✅ Created 'order_items' table.");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
