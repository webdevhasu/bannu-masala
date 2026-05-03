import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

const sql = neon(DATABASE_URL);

async function main() {
  console.log('Simplifying Reviews system...');

  try {
    // Drop user_id foreign key from reviews
    console.log('Dropping user_id from reviews table...');
    await sql`
      ALTER TABLE reviews 
      DROP COLUMN IF EXISTS user_id CASCADE;
    `;
    console.log('✓ Dropped user_id');

    // Add reviewer_name column
    console.log('Adding reviewer_name to reviews table...');
    await sql`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS reviewer_name TEXT;
    `;
    
    // Update existing null reviewer_names
    await sql`
      UPDATE reviews SET reviewer_name = 'Anonymous' WHERE reviewer_name IS NULL;
    `;
    console.log('✓ Added reviewer_name');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
