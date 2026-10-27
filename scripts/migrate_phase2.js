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

const CATEGORIES = [
  {
    name: 'Biryani & Rice',
    slug: 'biryani-rice',
    description: 'Aromatic blends for biryani, pulao and rice dishes.',
    sort_order: 1,
  },
  {
    name: 'BBQ & Kabab',
    slug: 'bbq-kabab',
    description: 'Smoky, bold masalas for kabab, tikka and barbecue.',
    sort_order: 2,
  },
  {
    name: 'Everyday Spices',
    slug: 'everyday-spices',
    description: 'Pure everyday spices for daily cooking.',
    sort_order: 3,
  },
  {
    name: 'Garam Masala',
    slug: 'garam-masala',
    description: 'Warming garam masala blends for curries and special dishes.',
    sort_order: 4,
  },
];

async function migrate() {
  console.log('Phase 2 migration started...');

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  console.log('Created categories table.');

  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_to_use TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS storage TEXT;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;`;
  console.log('Added product fields (category, ingredients, usage, storage, stock, active, featured).');

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_fkey'
      ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_category_id_fkey
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await sql`ALTER TABLE hot_deals ADD COLUMN IF NOT EXISTS product_id INTEGER;`;
  await sql`ALTER TABLE hot_deals ADD COLUMN IF NOT EXISTS variant TEXT;`;
  await sql`ALTER TABLE hot_deals ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;`;
  await sql`ALTER TABLE hot_deals ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;`;
  console.log('Linked hot_deals to products (product, variant, schedule).');

  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hot_deals_product ON hot_deals(product_id);`;

  for (const category of CATEGORIES) {
    await sql`
      INSERT INTO categories (name, slug, description, sort_order, is_active)
      VALUES (${category.name}, ${category.slug}, ${category.description}, ${category.sort_order}, true)
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log('Seeded starter categories.');

  const categoryRows = await sql`SELECT id, slug FROM categories`;
  const bySlug = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

  await sql`
    UPDATE products SET category_id = ${bySlug['biryani-rice']}
    WHERE category_id IS NULL AND (name ILIKE '%biryani%' OR name ILIKE '%dal%')
  `;
  await sql`
    UPDATE products SET category_id = ${bySlug['garam-masala']}
    WHERE category_id IS NULL AND name ILIKE '%garam masala%'
  `;
  await sql`
    UPDATE products SET category_id = ${bySlug['bbq-kabab']}
    WHERE category_id IS NULL AND (name ILIKE '%kabab%' OR name ILIKE '%tikka%' OR name ILIKE '%bbq%')
  `;
  await sql`
    UPDATE products SET category_id = ${bySlug['everyday-spices']}
    WHERE category_id IS NULL
  `;
  console.log('Assigned existing products to categories.');

  await sql`
    UPDATE products SET is_featured = true
    WHERE name ILIKE '%biryani%' OR name ILIKE '%kabab%' OR name ILIKE '%garam masala powder%'
  `;

  const summary = await sql`
    SELECT p.id, p.name, c.name AS category, p.is_featured, p.is_active, p.stock
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id
  `;
  console.log('Products after migration:', summary);

  console.log('Phase 2 migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
