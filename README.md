# Absensi KKN - Sistem Pencatatan Kehadiran

Sistem absensi digital untuk KKN Desa Pasucen 2025/2026.

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Supabase Database

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run the SQL from `supabase/schema.sql`
3. Copy your Supabase URL and Anon Key from Project Settings

### 4. Migrate Existing Data (Optional)

If you have existing data in `data/absensi.json`:

```bash
pnpm migrate
```

Follow the prompts to enter your Supabase credentials.

### 5. Run Development Server

```bash
pnpm dev
# Application berjalan di http://localhost:5173
```

## 📁 Struktur Proyek

```
absensi-kkn/
├── src/              # Frontend (Preact + Vite)
│   ├── components/
│   ├── lib/
│   │   ├── api.ts       # Supabase API client
│   │   └── supabase.ts  # Supabase configuration
│   ├── pages/
│   └── store/
├── supabase/         # Database schema
│   └── schema.sql
├── scripts/          # Migration scripts
│   └── migrate-to-supabase.ts
├── data/             # Backup data
│   └── absensi.json
└── dist/             # Build output
```

## 🔧 Setup Pertama Kali

### A. Setup Supabase

1. **Buat Project Baru**
   - Buka https://supabase.com
   - Sign in / Sign up
   - Create new project

2. **Setup Database**
   - Buka SQL Editor di dashboard Supabase
   - Copy paste isi file `supabase/schema.sql`
   - Klik "Run" untuk execute

3. **Dapatkan API Keys**
   - Buka Settings → API
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon/public" key → `VITE_SUPABASE_ANON_KEY`

### B. Install & Configure

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env dengan credentials dari Supabase

# Migrate data (jika ada data lama)
pnpm migrate
```

## 🌐 Deployment

### Deploy ke Netlify

1. **Build aplikasi:**
   ```bash
   pnpm build
   ```

2. **Deploy folder `dist/` ke Netlify:**
   - Login ke https://netlify.com
   - Drag & drop folder `dist/`
   - Atau connect dari GitHub

3. **Set Environment Variables di Netlify:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Configure Build Settings:**
   - Build command: `pnpm build`
   - Publish directory: `dist`

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

## 🔐 Default Login

**Admin:**
- NIM: `202211017`
- Password: `admin@2024`

**Mahasiswa:**
- Gunakan NIM yang sudah terdaftar
- Atau register akun baru

## 📊 Data

Default data includes:
- **13 Mahasiswa** (Informatika + Teknik Elektro)
- **3 Shift**: Pagi (09:00), Siang (14:00), Malam (21:00)
- **65+ Record Absensi** (data contoh)

## 🛠️ Tech Stack

**Frontend:**
- Preact (React-like, lightweight)
- Vite (Build tool)
- TailwindCSS
- TypeScript

**Backend & Database:**
- Supabase (PostgreSQL + Auth + Realtime)
- Row Level Security (RLS)

## 📝 Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm typecheck    # Type check only

# Migration
pnpm migrate      # Migrate JSON data to Supabase
```

## 🛠️ Troubleshooting

**Supabase connection error?**
```bash
# Check .env file
cat .env

# Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY benar
```

**Migration gagal?**
```bash
# Pastikan schema.sql sudah dijalankan di Supabase
# Check koneksi internet
# Pastikan credentials benar
```

**Build error?**
```bash
pnpm typecheck    # Check type errors
pnpm build        # Rebuild
```

## 📄 License

KKN Desa Pasucen 2025/2026
Sekolah Tinggi Teknik Pati
