const Database = require('better-sqlite3');
const { neon } = require('@neondatabase/serverless');

const localDb = new Database('bannu_masala.db');
const dbUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_0fEVkwnKD5rc@ep-round-shape-a1squ9y0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
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
        INSERT INTO products (name, slug, description, image, price_250g, price_500g, price_1kg)
        VALUES (${p.name}, ${p.slug}, ${p.description}, ${p.image}, ${p.price_250g}, ${p.price_500g}, ${p.price_1kg})
      `;
      console.log(`✅ Migrated: ${p.name}`);
    }

    console.log("Migration completed successfully! All products copied.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrateData();
