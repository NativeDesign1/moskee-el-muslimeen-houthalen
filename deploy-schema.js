// Script om SQL schema te deployen naar Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials niet gevonden in .env');
  process.exit(1);
}

console.log('📦 Supabase client initialiseren...');
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n⚠️  BELANGRIJK:');
console.log('Dit script kan het SQL schema NIET automatisch deployen.');
console.log('De Supabase JavaScript client heeft geen rechten om DDL queries uit te voeren.\n');
console.log('✅ OPLOSSING: Gebruik de Supabase Dashboard:');
console.log('1. Open: https://supabase.com/dashboard/project/xgnhpsbvtlfugvdrwctm/sql/new');
console.log('2. Kopieer de inhoud van supabase-schema.sql');
console.log('3. Plak in de SQL Editor');
console.log('4. Klik op "Run" (of Ctrl+Enter)\n');

console.log('🔍 Test: Controleren of articles tabel bestaat...');
const { data, error } = await supabase
  .from('articles')
  .select('count')
  .limit(1);

if (error) {
  if (error.message.includes('does not exist') || error.message.includes('not found')) {
    console.log('❌ Tabel bestaat nog niet - deploy eerst het schema via Supabase Dashboard');
  } else {
    console.log('❌ Error:', error.message);
  }
} else {
  console.log('✅ Articles tabel bestaat! Database is klaar.');
}
