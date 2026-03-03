# Absensi KKN - Deployment Guide

## Arsitektur Baru

Aplikasi sekarang menggunakan arsitektur **Serverless**:
- **Frontend**: Preact + Vite (deploy ke Netlify)
- **Backend & Database**: Supabase (PostgreSQL + Auth + Realtime)

Data tersimpan di cloud (Supabase), sehingga dapat diakses dari browser apapun dan device apapun.

---

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **pnpm** package manager
3. **Supabase** account (free tier available)
4. **Netlify** account (free tier available)

---

## 🚀 Setup & Deployment Steps

### Step 1: Setup Supabase Database

#### 1.1 Create Supabase Project

1. Buka https://supabase.com
2. Sign in / Sign up
3. Click "New Project"
4. Pilih organization
5. Enter project name: `absensi-kkn`
6. Set database password (simpan untuk referensi)
7. Pilih region terdekat (Singapore untuk Indonesia)
8. Click "Create new project"

#### 1.2 Setup Database Schema

1. Setelah project dibuat, buka **SQL Editor** (sidebar kiri)
2. Click "New Query"
3. Copy paste isi file `supabase/schema.sql`
4. Click **"Run"** atau tekan `Ctrl+Enter`
5. Verify tables created: `mahasiswa`, `shift`, `absensi`, `settings`

#### 1.3 Get API Credentials

1. Buka **Settings** → **API** (sidebar kiri)
2. Copy nilai berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (panjang)

---

### Step 2: Setup Local Development

#### 2.1 Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd absensi-kkn

# Install dependencies
pnpm install
```

#### 2.2 Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

Isi dengan credentials dari Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2.3 Migrate Existing Data (Optional)

Jika ada data lama di `data/absensi.json`:

```bash
# Run migration script
pnpm migrate

# Follow prompts:
# - Enter Supabase URL
# - Enter Supabase Anon Key
```

Script akan:
- Load data dari JSON
- Insert ke Supabase
- Tampilkan summary

#### 2.4 Test Locally

```bash
# Start development server
pnpm dev

# Open browser: http://localhost:5173
```

Test login dengan:
- NIM: `202211017` (admin)

---

### Step 3: Deploy to Netlify

#### Option A: Deploy via Netlify CLI (Recommended)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Initialize project
netlify init

# Pilih:
# - Create & configure a new site
# - Pilih organization
# - Site name: absensi-kkn-absensi

# Build dan deploy
netlify deploy --prod
```

#### Option B: Deploy via Netlify Dashboard

1. **Build aplikasi:**
   ```bash
   pnpm build
   ```

2. **Login ke Netlify:**
   - Buka https://app.netlify.com
   - Sign in

3. **Create New Site:**
   - Click "Add new site" → "Deploy manually"
   - Drag & drop folder `dist/`
   - Tunggu upload selesai

4. **Configure Site:**
   - Site name: `absensi-kkn-absensi` (atau custom)
   - Domain settings: customize jika perlu

5. **Set Environment Variables:**
   - Buka site settings → **Environment variables**
   - Add variables:
     ```
     Key: VITE_SUPABASE_URL
     Value: https://your-project.supabase.co
     
     Key: VITE_SUPABASE_ANON_KEY
     Value: your-anon-key
     ```

6. **Re-deploy:**
   - Buka **Deploys** tab
   - Click "Trigger deploy" → "Deploy site"

#### Option C: Deploy via GitHub Integration

1. **Push code ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect di Netlify:**
   - Login Netlify
   - "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository
   - Build settings:
     - Build command: `pnpm build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Set Environment Variables:**
   - Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

4. **Trigger redeploy** untuk apply changes

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbG...` |

### Netlify Configuration

File `netlify.toml` sudah ada di project:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📊 Database Structure

### Tables

#### `mahasiswa`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nim | VARCHAR(20) | NIM (unique) |
| nama | VARCHAR(255) | Nama lengkap |
| prodi | VARCHAR(100) | Program studi |
| kelas | VARCHAR(50) | Kelas (Reguler/Karyawan) |
| created_at | TIMESTAMP | Record timestamp |

#### `shift`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nama_shift | VARCHAR(50) | Nama shift (Pagi/Siang/Malam) |
| jam_absen | TIME | Jam absen |
| created_at | TIMESTAMP | Record timestamp |

#### `absensi`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| mahasiswa_id | INTEGER | FK to mahasiswa |
| shift_id | INTEGER | FK to shift |
| tanggal | DATE | Tanggal absensi |
| waktu_absen | TIME | Waktu actual absen |
| status | VARCHAR(20) | hadir/izin |
| keterangan | TEXT | Keterangan tambahan |
| created_at | TIMESTAMP | Record timestamp |

#### `settings`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| key_name | VARCHAR(100) | Setting key |
| key_value | TEXT | Setting value |
| updated_at | TIMESTAMP | Last update |

---

## 🔐 Security

### Row Level Security (RLS)

Supabase menggunakan RLS untuk keamanan:

- **Mahasiswa**: Public read, public insert (untuk register)
- **Shift**: Public read
- **Absensi**: Public read, public insert
- **Settings**: Public read

### Admin Access

Admin ditentukan oleh field `admin_list` di table `settings`:

```json
["202211017"]
```

---

## 📝 Maintenance

### Backup Data

#### Export from Supabase

1. Buka Supabase Dashboard
2. Table Editor → pilih table
3. Click "..." → "Export data"
4. Pilih format CSV/JSON

#### Import Data

1. Table Editor → pilih table
2. Click "Insert" → "Import CSV"
3. Upload file CSV

### Update Data

Via Supabase Dashboard:
- Table Editor → pilih record → Edit

Via SQL:
```sql
UPDATE mahasiswa 
SET nama = 'New Name' 
WHERE nim = '202211017';
```

### Add New Mahasiswa

Via SQL:
```sql
INSERT INTO mahasiswa (nim, nama, prodi, kelas)
VALUES ('2024001001', 'Nama Mahasiswa', 'Informatika', 'Reguler');
```

---

## 🚨 Troubleshooting

### Build Error

```bash
# Check types
pnpm typecheck

# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

### Supabase Connection Error

1. Check `.env` file exists
2. Verify credentials di Supabase Dashboard
3. Test connection:
   ```javascript
   // Open browser console
   const { data, error } = await supabase
     .from('shift')
     .select('*');
   console.log(error || data);
   ```

### Netlify Deploy Fails

1. Check build logs di Netlify
2. Verify environment variables set
3. Test build locally:
   ```bash
   pnpm build
   ```

### Data Not Showing

1. Check RLS policies di Supabase
2. Verify data exists in Table Editor
3. Check browser console for errors

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Preact Documentation](https://preactjs.com)
- [Vite Documentation](https://vitejs.dev)

---

## 💰 Cost Estimate

**Free Tier:**

- **Supabase**: Free up to 500MB database, 50K MAU
- **Netlify**: Free up to 100GB bandwidth/month

Cukup untuk penggunaan KKN dengan puluhan pengguna.

---

KKN Desa Pasucen 2025/2026
Sekolah Tinggi Teknik Pati
