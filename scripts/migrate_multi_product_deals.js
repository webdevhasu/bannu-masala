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

function asInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCustomVariants(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function buildVariantsMap(product) {
  const variants = {
    '250g': asInt(product.price_250g),
    '500g': asInt(product.price_500g),
    '1kg': asInt(product.price_1kg),
  };
  for (const custom of parseCustomVariants(product.custom_variants)) {
    if (!custom) continue;
    const label = typeof custom.label === 'string' ? custom.label.trim() : '';
    const price = asInt(custom.price);
    if (!label || price <= 0) continue;
    variants[label] = price;
  }
  return variants;
}

function computeSalePrice(originalPrice, percent) {
  const value = Math.round((originalPrice * (100 - percent)) / 100);
  return Math.max(1, Math.min(originalPrice - 1, value));
}

async function migrate() {
  console.log('Multi-product deals migration started...');

  await sql`
    ALTER TABLE hot_deals
    ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
  `;
  console.log('Added discount_percent column to hot_deals.');

  await sql`
    CREATE TABLE IF NOT EXISTS deal_items (
      id SERIAL PRIMARY KEY,
      deal_id INTEGER NOT NULL REFERENCES hot_deals(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant TEXT NOT NULL,
      original_price INTEGER NOT NULL DEFAULT 0,
      sale_price INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (deal_id, product_id, variant)
    );
  `;
  console.log('Created deal_items table.');

  await sql`CREATE INDEX IF NOT EXISTS idx_deal_items_deal ON deal_items(deal_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_deal_items_product ON deal_items(product_id);`;

  const legacyDeals = await sql`
    SELECT d.*, p.price_250g, p.price_500g, p.price_1kg, p.custom_variants
    FROM hot_deals d
    JOIN products p ON p.id = d.product_id
    WHERE d.product_id IS NOT NULL AND d.variant IS NOT NULL
    ORDER BY d.id ASC
  `;

  for (const deal of legacyDeals) {
    const existing = await sql`SELECT id FROM deal_items WHERE deal_id = ${deal.id} LIMIT 1`;
    if (existing.length > 0) continue;

    const variants = buildVariantsMap(deal);
    const originalPrice = asInt(variants[deal.variant]) || asInt(deal.original_price);
    const salePrice = asInt(deal.price);
    if (originalPrice <= 0 || salePrice <= 0 || salePrice >= originalPrice) continue;

    const percent = Math.max(1, Math.round(((originalPrice - salePrice) / originalPrice) * 100));

    await sql`
      INSERT INTO deal_items (deal_id, product_id, variant, original_price, sale_price)
      VALUES (${deal.id}, ${deal.product_id}, ${deal.variant}, ${originalPrice}, ${salePrice})
      ON CONFLICT (deal_id, product_id, variant) DO NOTHING
    `;

    await sql`
      UPDATE hot_deals
      SET discount_percent = ${percent},
          original_price = ${originalPrice}
      WHERE id = ${deal.id}
    `;

    console.log(
      `Migrated deal #${deal.id} -> ${deal.variant} (${percent}% off, Rs ${salePrice})`
    );
  }

  const summary = await sql`
    SELECT d.id, d.title, d.discount_percent, COUNT(di.id)::int AS item_count
    FROM hot_deals d
    LEFT JOIN deal_items di ON di.deal_id = d.id
    GROUP BY d.id
    ORDER BY d.id
  `;
  console.log('Deals after migration:', summary);
  console.log('Multi-product deals migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
