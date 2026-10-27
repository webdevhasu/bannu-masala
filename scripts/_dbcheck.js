const fs = require('fs');
const path = require('path');

for (const file of ['.env.local', '.env']) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!Object.prototype.hasOwnProperty.call(process.env, k)) process.env[k] = v;
  }
}

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const products = await sql`SELECT id, name, slug, price_250g, price_500g, price_1kg, image FROM products ORDER BY id`;
  console.log(JSON.stringify(products, null, 2));
  const reviews = await sql`SELECT id, product_id, reviewer_name, rating, comment, created_at FROM reviews ORDER BY id`;
  console.log('REVIEWS', JSON.stringify(reviews, null, 2));
})().catch((e) => {
  console.error('DB ERROR:', e.message);
  process.exit(1);
});
