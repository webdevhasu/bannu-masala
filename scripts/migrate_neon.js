const { neon } = require('@neondatabase/serverless');

// Ensure script detects the environment variable properly (since it's not a Next.js environment by default running via node)
const dbUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_0fEVkwnKD5rc@ep-round-shape-a1squ9y0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
        price_250g INTEGER DEFAULT 0,
        price_500g INTEGER DEFAULT 0,
        price_1kg INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Created 'products' table.");

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
