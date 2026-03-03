// scripts/migrate-to-supabase.ts
// Script to migrate existing JSON data to Supabase
// Automatically uses credentials from .env file

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

interface Database {
  mahasiswa: Array<{
    id: number;
    nim: string;
    nama: string;
    prodi: string;
    kelas: string;
  }>;
  shift: Array<{
    id: number;
    nama_shift: string;
    jam_absen: string;
  }>;
  absensi: Array<{
    id: number;
    mahasiswa_id: number;
    shift_id: number;
    tanggal: string;
    waktu_absen: string | null;
    status: 'hadir' | 'izin';
    keterangan: string | null;
  }>;
  settings: {
    admin_password: string;
    admin_list: string[];
  };
}

async function migrate() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   Absensi KKN - Supabase Migration Tool      ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  // Get Supabase credentials from .env
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log(`✓ Using Supabase: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Load existing JSON data
  const dataPath = join(__dirname, '..', 'data', 'absensi.json');
  console.log(`📂 Loading data from: ${dataPath}`);

  let data: Database;
  try {
    const content = readFileSync(dataPath, 'utf-8');
    data = JSON.parse(content);
    console.log(`✓ Data loaded successfully`);
    console.log(`  - Mahasiswa: ${data.mahasiswa.length} records`);
    console.log(`  - Shift: ${data.shift.length} records`);
    console.log(`  - Absensi: ${data.absensi.length} records`);
  } catch (error) {
    console.error('❌ Failed to load data:', error);
    process.exit(1);
  }

  console.log('\n🚀 Starting migration...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Migrate Mahasiswa
  console.log('📋 Migrating Mahasiswa...');
  for (const mhs of data.mahasiswa) {
    try {
      const { error } = await supabase.from('mahasiswa').upsert({
        id: mhs.id,
        nim: mhs.nim,
        nama: mhs.nama,
        prodi: mhs.prodi,
        kelas: mhs.kelas,
      });

      if (error) {
        console.error(`  ❌ ${mhs.nama}: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✓ ${mhs.nama}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`  ❌ ${mhs.nama}: ${error.message}`);
      errorCount++;
    }
  }

  // Migrate Shift (skip if already exists)
  console.log('\n📋 Migrating Shift...');
  for (const shift of data.shift) {
    try {
      const { error } = await supabase.from('shift').upsert({
        id: shift.id,
        nama_shift: shift.nama_shift,
        jam_absen: shift.jam_absen,
      });

      if (error) {
        if (error.code === '23505') {
          console.log(`  ⊘ ${shift.nama_shift} (already exists)`);
          skipCount++;
        } else {
          console.error(`  ❌ ${shift.nama_shift}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✓ ${shift.nama_shift}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`  ❌ ${shift.nama_shift}: ${error.message}`);
      errorCount++;
    }
  }

  // Migrate Absensi
  console.log('\n📋 Migrating Absensi...');
  console.log(`  Total records: ${data.absensi.length}`);

  for (const absen of data.absensi) {
    try {
      const { error } = await supabase.from('absensi').upsert({
        id: absen.id,
        mahasiswa_id: absen.mahasiswa_id,
        shift_id: absen.shift_id,
        tanggal: absen.tanggal,
        waktu_absen: absen.waktu_absen,
        status: absen.status,
        keterangan: absen.keterangan,
      });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - skip
          skipCount++;
        } else {
          console.error(`  ❌ ID ${absen.id}: ${error.message}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    } catch (error: any) {
      console.error(`  ❌ ID ${absen.id}: ${error.message}`);
      errorCount++;
    }
  }

  // Migrate Settings
  console.log('\n📋 Migrating Settings...');
  try {
    const { error: err1 } = await supabase.from('settings').upsert({
      key_name: 'admin_password',
      key_value: data.settings.admin_password,
    });

    if (err1) {
      console.error(`  ❌ Admin password: ${err1.message}`);
      errorCount++;
    } else {
      console.log('  ✓ Admin password');
      successCount++;
    }

    const { error: err2 } = await supabase.from('settings').upsert({
      key_name: 'admin_list',
      key_value: JSON.stringify(data.settings.admin_list),
    });

    if (err2) {
      console.error(`  ❌ Admin list: ${err2.message}`);
      errorCount++;
    } else {
      console.log('  ✓ Admin list');
      successCount++;
    }
  } catch (error: any) {
    console.error(`  ❌ Settings: ${error.message}`);
    errorCount++;
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   Migration Summary                           ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log(`  ✓ Success: ${successCount}`);
  console.log(`  ⊘ Skipped: ${skipCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log('');

  if (errorCount === 0) {
    console.log('✅ Migration completed successfully!\n');
  } else {
    console.log('⚠️  Migration completed with errors. Please check the logs above.\n');
  }
}

// Run migration
migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
