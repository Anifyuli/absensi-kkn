# Migration Guide - JSON to Supabase

Panduan ini untuk migrasi dari database JSON lama ke Supabase.

## 📋 Prerequisites

1. File `.env` dengan credentials Supabase
2. Data lama ada di `data/absensi.json`
3. Schema SQL sudah dijalankan di Supabase

## 🚀 Quick Migration

### Option 1: Automated Script (Recommended)

```bash
# Run migration script
pnpm migrate

# Follow prompts:
# - Enter Supabase URL
# - Enter Supabase Anon Key
```

Script akan otomatis:
- Load data dari JSON
- Insert ke Supabase dengan upsert (skip duplicates)
- Tampilkan summary

### Option 2: Manual via Supabase Dashboard

#### 1. Export JSON to CSV

Convert `data/absensi.json` ke CSV files:

**mahasiswa.csv:**
```csv
id,nim,nama,prodi,kelas
1,2024001001,Ahmad Iwan Junaidi,Teknik Elektro,Karyawan
...
```

**absensi.csv:**
```csv
id,mahasiswa_id,shift_id,tanggal,waktu_absen,status,keterangan
40,1,1,2026-02-25,09:00:00,izin,Bekerja
...
```

#### 2. Import via Table Editor

1. Buka Supabase Dashboard
2. Table Editor → `mahasiswa`
3. Click "..." → "Import data"
4. Upload CSV file
5. Repeat untuk table `absensi` dan `shift`

#### 3. Insert Settings

SQL Editor:
```sql
INSERT INTO settings (key_name, key_value) VALUES
  ('admin_password', 'admin@2024'),
  ('admin_list', '["202211017"]')
ON CONFLICT (key_name) DO UPDATE SET key_value = EXCLUDED.key_value;
```

## 🔍 Verify Migration

### Check Counts

SQL Editor:
```sql
-- Check mahasiswa count
SELECT COUNT(*) FROM mahasiswa;  -- Should be 13

-- Check absensi count  
SELECT COUNT(*) FROM absensi;  -- Should be 65+

-- Check shifts
SELECT * FROM shift;  -- Should be 3 rows
```

### Test Application

1. Run `pnpm dev`
2. Open http://localhost:5173
3. Login dengan NIM `202211017`
4. Check data tampil dengan benar

## 🚨 Troubleshooting

### Duplicate Key Error

Jika ada error duplicate key:
```sql
-- Reset sequences (if needed)
SELECT setval('mahasiswa_id_seq', (SELECT MAX(id) FROM mahasiswa));
SELECT setval('absensi_id_seq', (SELECT MAX(id) FROM absensi));
SELECT setval('shift_id_seq', (SELECT MAX(id) FROM shift));
```

### Data Not Showing

1. Check RLS policies:
   ```sql
   -- Verify policies exist
   SELECT * FROM pg_policies WHERE tablename IN ('mahasiswa', 'absensi', 'shift');
   ```

2. Test query manually:
   ```sql
   SELECT * FROM mahasiswa LIMIT 5;
   ```

### Migration Script Fails

1. Check internet connection
2. Verify Supabase credentials
3. Ensure schema.sql sudah dijalankan
4. Try manual import via dashboard

## 📊 Post-Migration

### Backup New Database

1. Supabase Dashboard → Table Editor
2. Each table: "..." → "Export data"
3. Save as CSV/JSON

### Clean Up Old Files

```bash
# Backup old data folder (optional)
cp -r data data-backup-$(date +%Y%m%d)

# Or keep just the backup
mv data/absensi-backup.json data/
rm data/absensi.json
```

## ✅ Migration Checklist

- [ ] Supabase project created
- [ ] Schema.sql executed
- [ ] .env file configured
- [ ] Migration script run successfully
- [ ] Data counts verified
- [ ] Application tested locally
- [ ] Backup created

---

KKN Desa Pasucen 2025/2026
Sekolah Tinggi Teknik Pati
