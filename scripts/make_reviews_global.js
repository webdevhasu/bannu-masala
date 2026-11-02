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
  console.log('Making reviews global (product_id nullable)...');
  
  // Make product_id nullable
  await sql`ALTER TABLE reviews ALTER COLUMN product_id DROP NOT NULL;`;
  console.log('✓ product_id is now nullable');
  
  // Create index for global reviews
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_global ON reviews(is_approved) WHERE is_approved = true;`;
  console.log('✓ Created global reviews index');
  
  console.log('Migration completed.');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});