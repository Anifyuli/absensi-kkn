# ⬡ ABSENSI — Preact + SQLite + Vite + Tailwind

MVP sistem absensi mahasiswa dengan 3 shift: **06:00 · 14:00 · 21:00**

## Tech Stack

| | |
|---|---|
| **Framework** | [Preact](https://preactjs.com) 10 + Hooks |
| **Language** | TypeScript 5 |
| **Bundler** | Vite 5 |
| **Styling** | Tailwind CSS 3 (JIT) |
| **Database** | SQLite via `sql.js` (WASM) |
| **Persistensi** | `localStorage` (SQLite binary → base64) |
| **Deploy** | Netlify (static) |

## Struktur Proyek

```
src/
├── db/
│   ├── database.ts      # sql.js init, migrations, helpers
│   ├── mahasiswa.ts     # CRUD mahasiswa
│   └── absensi.ts       # CRUD absensi, queries, summary
├── lib/
│   ├── shifts.ts        # Logika shift & window check-in
│   └── auth.ts          # Session management
├── store/
│   └── index.ts         # Global state (Context + useState)
├── components/
│   ├── Clock.tsx        # Jam digital live
│   ├── ShiftCard.tsx    # Kartu shift per sesi
│   └── Toast.tsx        # Notifikasi
├── pages/
│   ├── LoginPage.tsx    # Masuk / Daftar / Admin tabs
│   ├── DashboardPage.tsx
│   └── AdminPage.tsx    # Panel admin + export CSV
├── App.tsx              # Root + splash screen
├── main.tsx
└── index.css            # Tailwind + custom utilities
```

## Menjalankan Lokal

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build & Deploy

```bash
npm run build
# Output: dist/
```

### Netlify CLI
```bash
npm i -g netlify-cli
netlify login && netlify deploy --prod
```

### Netlify Dashboard
Upload folder `dist/` di app.netlify.com

### Git Integration
- Build command: `npm run build`
- Publish directory: `dist`

## Shift & Window Check-in

| Shift | Target | Window Absen |
|---|---|---|
| Pagi 🌅 | 06:00 | 05:00 – 07:00 |
| Siang ☀️ | 14:00 | 13:00 – 15:00 |
| Malam 🌙 | 21:00 | 20:00 – 22:00 |

## Akun

- **Mahasiswa**: Daftar dengan NIM unik
- **Admin**: Login dengan password `admin@2024`
