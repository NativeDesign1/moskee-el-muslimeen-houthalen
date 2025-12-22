import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Direct database connection (niet via pooler)
const connectionString = 'postgresql://postgres.xgnhpsbvtlfugvdrwctm:Walid123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

console.log('🚀 Schema deployen naar Supabase...\n');

const client = new pg.Client({ connectionString });

try {
  await client.connect();
  console.log('✅ Verbonden met database\n');

  // Lees SQL schema
  const sqlPath = join(__dirname, 'supabase-schema.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  
  console.log('📝 SQL schema uitvoeren...\n');
  
  await client.query(sql);
  
  console.log('✅ Schema succesvol gedeployed!\n');
  console.log('🎉 Database is klaar:');
  console.log('   - articles tabel');
  console.log('   - categories tabel');
  console.log('   - Row Level Security policies');
  console.log('   - Voorbeeld data\n');
  
} catch (error) {
  console.error('❌ Fout:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
