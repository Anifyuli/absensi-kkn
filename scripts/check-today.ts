// scripts/check-today.ts
// Check absensi untuk hari ini

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

async function checkToday() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n📅 Checking absensi for: ${today}\n`);

  // Get all absensi for today
  const { data: absensi } = await supabase
    .from('absensi')
    .select(`
      *,
      mahasiswa:mahasiswa_id (nama, nim),
      shift:shift_id (nama_shift, jam_absen)
    `)
    .eq('tanggal', today)
    .order('shift_id');

  if (!absensi || absensi.length === 0) {
    console.log('✅ No absensi records for today. You can record new attendance.');
  } else {
    console.log(`⚠️  Found ${absensi.length} records for today:\n`);
    
    // Group by shift
    const byShift: Record<number, any[]> = {};
    absensi.forEach(a => {
      if (!byShift[a.shift_id]) byShift[a.shift_id] = [];
      byShift[a.shift_id].push(a);
    });

    Object.keys(byShift).forEach(shiftId => {
      const records = byShift[parseInt(shiftId)];
      const shiftName = records[0].shift?.nama_shift || `Shift ${shiftId}`;
      console.log(`\n📌 ${shiftName}:`);
      records.forEach(r => {
        const mhs = r.mahasiswa as any;
        console.log(`   - ${mhs?.nama} (${mhs?.nim}) - ${r.status}`);
      });
    });

    console.log('\n💡 To reset today\'s data, run: pnpm clear:today\n');
  }
}

checkToday();
