// scripts/debug-absensi.ts
// Debug absensi records

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  
  console.log('\n🔍 Debug Absensi Check\n');
  console.log(`Current datetime: ${now.toISOString()}`);
  console.log(`Local date: ${today}`);
  console.log(`Month (0-indexed): ${now.getMonth()}`);
  console.log(`Date: ${now.getDate()}\n`);

  // Check all unique dates in database
  const { data: allData } = await supabase
    .from('absensi')
    .select('tanggal, mahasiswa_id, shift_id')
    .order('tanggal', { ascending: false })
    .limit(20);

  console.log('📅 Recent dates in database:');
  const uniqueDates = [...new Set(allData?.map(d => d.tanggal) || [])];
  uniqueDates.forEach(d => console.log(`   - ${d}`));
  
  // Check if there's any record for a specific mahasiswa
  console.log('\n\n👤 Checking for mahasiswa_id = 6 (Moh. Anif Yuliansyah):');
  const { data: mhs6Data } = await supabase
    .from('absensi')
    .select('tanggal, shift_id, status')
    .eq('mahasiswa_id', 6)
    .order('tanggal', { ascending: false })
    .limit(10);

  if (mhs6Data && mhs6Data.length > 0) {
    mhs6Data.forEach(r => {
      const isToday = r.tanggal === today;
      console.log(`   - ${r.tanggal} | Shift ${r.shift_id} | ${r.status} ${isToday ? '← TODAY!' : ''}`);
    });
  } else {
    console.log('   No records found');
  }

  // Check for duplicate constraint
  console.log('\n\n🔎 Checking unique constraint (mahasiswa_id, shift_id, tanggal):');
  const { data: todayData } = await supabase
    .from('absensi')
    .select('mahasiswa_id, shift_id, tanggal')
    .eq('tanggal', today);

  if (todayData && todayData.length > 0) {
    console.log(`⚠️  Found ${todayData.length} records for TODAY (${today}):`);
    todayData.forEach(r => {
      console.log(`   - Mahasiswa ${r.mahasiswa_id}, Shift ${r.shift_id}`);
    });
  } else {
    console.log(`✅ No records for today (${today})`);
  }
}

debug();
