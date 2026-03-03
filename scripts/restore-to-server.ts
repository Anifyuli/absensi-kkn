// Script untuk restore data ke backend
// Usage: node scripts/restore-to-server.js backup-file.json http://localhost:3001

import { readFileSync } from 'fs';
import { join } from 'path';

const backupFile = process.argv[2] || './backup.json';
const apiUrl = process.argv[3] || 'http://localhost:3001';

async function restoreDatabase(backupPath: string, apiBaseUrl: string) {
  console.log('🔄 Memulai restore database...');
  console.log(`📁 File backup: ${backupPath}`);
  console.log(`🌐 API URL: ${apiBaseUrl}`);

  let backup: any;

  // Read backup file
  try {
    const content = readFileSync(backupPath, 'utf-8');
    backup = JSON.parse(content);
    console.log('✓ File backup berhasil dibaca');
  } catch (err) {
    console.error('❌ Gagal membaca file backup:', err);
    return;
  }

  // Extract database (base64 encoded sql.js)
  const dbBase64 = backup.database;
  if (!dbBase64) {
    console.error('❌ Tidak ada data database di backup');
    return;
  }

  console.log('📦 Mengdecode database...');

  // Convert base64 to Uint8Array
  const binary = atob(dbBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Load sql.js to extract data
  const initSqlJs = await import('sql.js');
  const SQL = await initSqlJs.default();
  const db = new SQL.Database(bytes);

  // Extract all data
  const mahasiswa = db.exec('SELECT * FROM mahasiswa ORDER BY id');
  const absensi = db.exec('SELECT * FROM absensi ORDER BY id');
  const shift = db.exec('SELECT * FROM shift ORDER BY id');

  console.log(`✓ Database loaded: ${mahasiswa[0]?.values.length || 0} mahasiswa, ${absensi[0]?.values.length || 0} absensi`);

  // Prepare data for API
  const mahasiswaData = mahasiswa[0]?.values.map(row => ({
    id: row[0] as number,
    nim: row[1] as string,
    nama: row[2] as string,
    prodi: row[3] as string,
    kelas: row[4] as string,
  })) || [];

  const absensiData = absensi[0]?.values.map(row => ({
    id: row[0] as number,
    mahasiswa_id: row[1] as number,
    shift_id: row[2] as number,
    tanggal: row[3] as string,
    waktu_absen: row[4] as string,
    status: row[5] as string,
    keterangan: row[6] as string,
  })) || [];

  // Restore via API
  console.log('\n📤 Restoring data ke server...');

  // 1. Restore mahasiswa
  console.log(`\n👤 Restoring ${mahasiswaData.length} mahasiswa...`);
  for (const m of mahasiswaData) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/mahasiswa/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      });
      if (res.ok) {
        console.log(`  ✓ ${m.nim} - ${m.nama}`);
      } else {
        console.log(`  ⚠ ${m.nim} - ${m.nama} (skip)`);
      }
    } catch (err) {
      console.error(`  ✗ ${m.nim}: ${err}`);
    }
  }

  // 2. Restore absensi
  console.log(`\n📋 Restoring ${absensiData.length} absensi...`);
  for (const a of absensiData) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/absensi/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(a),
      });
      if (res.ok) {
        console.log(`  ✓ ${a.tanggal} - shift ${a.shift_id}`);
      } else {
        console.log(`  ⚠ ${a.tanggal} - shift ${a.shift_id} (skip)`);
      }
    } catch (err) {
      console.error(`  ✗ ${a.tanggal}: ${err}`);
    }
  }

  console.log('\n✅ Restore selesai!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  restoreDatabase(backupFile, apiUrl).catch(console.error);
}

export { restoreDatabase };
