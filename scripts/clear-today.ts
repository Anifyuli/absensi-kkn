// scripts/clear-today.ts
// Clear absensi records for today

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearToday() {
  const today = new Date().toISOString().slice(0, 10);
  
  console.log('\n⚠️  WARNING: This will delete ALL absensi records for today!\n');
  console.log(`📅 Date: ${today}`);
  
  // Check how many records
  const { count } = await supabase
    .from('absensi')
    .select('*', { count: 'exact', head: true })
    .eq('tanggal', today);

  if (!count || count === 0) {
    console.log('\n✅ No records to delete for today.');
    process.exit(0);
  }

  console.log(`📊 Records to delete: ${count}\n`);
  
  const confirm = await prompt('Are you sure? Type "YES" to confirm: ');
  
  if (confirm !== 'YES') {
    console.log('\n❌ Cancelled.');
    process.exit(0);
  }

  console.log('\n🗑️  Deleting records...');

  const { error } = await supabase
    .from('absensi')
    .delete()
    .eq('tanggal', today);

  if (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }

  console.log(`\n✅ Successfully deleted ${count} records for ${today}\n`);
}

clearToday().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

rl.on('close', () => {
  // Clean exit
});
