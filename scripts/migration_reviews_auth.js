import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

const sql = neon(DATABASE_URL);

async function main() {
  console.log('Running Auth & Reviews migrations...');

  try {
    // 1. Alter products table to add gallery
    console.log('Adding gallery to products table...');
    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
    `;
    console.log('✓ Added gallery column');

    // 2. Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Created users table');

    // 3. Create reviews table
    console.log('Creating reviews table...');
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product
          FOREIGN KEY(product_id) 
          REFERENCES products(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_user
          FOREIGN KEY(user_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;
    console.log('✓ Created reviews table');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
