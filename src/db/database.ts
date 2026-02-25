// src/db/database.ts
// SQLite via sql.js (WASM), persisted as base64 in localStorage

const DB_KEY = "absensi_preact_db_v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlJsStatic = any;
type Database = {
  run: (sql: string, params?: (string | number | null)[]) => void;
  exec: (
    sql: string,
    params?: (string | number | null)[],
  ) => { columns: string[]; values: (string | number | null)[][] }[];
  export: () => Uint8Array;
};

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db)
    throw new Error("Database not initialized. Call initDatabase() first.");
  return _db;
}

export async function initDatabase(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SQL: SqlJsStatic = await (window as any).initSqlJs({
    locateFile: (file: string) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
  });

  // Try to load existing database from localStorage
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    // Restore from localStorage
    const binary = atob(saved);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    _db = new SQL.Database(bytes);
  } else {
    // Create new database and run migrations
    _db = new SQL.Database();
  }

  runMigrations();
  persist();
}

export function persist(): void {
  if (!_db) return;
  const data = _db.export();
  const b64 = btoa(String.fromCharCode(...Array.from(data)));
  localStorage.setItem(DB_KEY, b64);
}

function runMigrations(): void {
  const db = getDb();

  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS mahasiswa (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nim     TEXT    NOT NULL UNIQUE,
      nama    TEXT    NOT NULL,
      prodi   TEXT    NOT NULL DEFAULT 'Informatika',
      kelas   TEXT    NOT NULL DEFAULT 'Reguler'
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shift (
      id          INTEGER PRIMARY KEY,
      nama_shift  TEXT    NOT NULL,
      jam_absen   TEXT    NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS absensi (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      mahasiswa_id    INTEGER NOT NULL,
      shift_id        INTEGER NOT NULL,
      tanggal         TEXT    NOT NULL,
      waktu_absen     TEXT,
      status          TEXT    NOT NULL DEFAULT 'belum_absen'
                            CHECK(status IN ('hadir','izin')),
      keterangan      TEXT,
      FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id),
      FOREIGN KEY (shift_id)     REFERENCES shift(id),
      UNIQUE (mahasiswa_id, shift_id, tanggal)
    );
  `);

  // Seed shifts (only if empty)
  const shiftCount =
    (db.exec(`SELECT COUNT(*) FROM shift`)[0]?.values[0][0] as number) ?? 0;
  if (shiftCount === 0) {
    db.run(`INSERT INTO shift (id, nama_shift, jam_absen) VALUES
      (1, 'Pagi',  '09:00'),
      (2, 'Siang', '14:00'),
      (3, 'Malam', '21:00');
    `);

    // Seed mahasiswa data (only on first run)
    db.run(`INSERT OR IGNORE INTO mahasiswa (nim, nama, prodi, kelas) VALUES
      ('2024001001', 'Ahmad Iwan Junaidi', 'Teknik Elektro', 'Karyawan'),
      ('202211004', 'Ahmad Nur Hidayatullah', 'Informatika', 'Reguler'),
      ('202211005', 'Ahmad Syauqi Hulaimi', 'Informatika', 'Karyawan'),
      ('202211010', 'Fadhil Musyaffa', 'Informatika', 'Reguler'),
      ('202311005', 'Irma Fatimatuz Zahro', 'Informatika', 'Reguler'),
      ('202211017', 'Moh. Anif Yuliansyah', 'Informatika', 'Karyawan'),
      ('202311008', 'Muhammad Adil Imamul Haq Mubarak', 'Informatika', 'Reguler'),
      ('202111008', 'Muhammad Anam Mustaghfirin', 'Informatika', 'Karyawan'),
      ('202311012', 'Muhammad Ziyan Firdaus', 'Informatika', 'Karyawan'),
      ('202311015', 'Novelia Agatha Sutanto', 'Informatika', 'Reguler'),
      ('202311018', 'Riza Badruz Zaman', 'Informatika', 'Karyawan'),
      ('202312009', 'Rizky Agung Laksono', 'Teknik Elektro', 'Reguler'),
      ('202312013', 'Yahya Khoiri Riyatno', 'Informatika', 'Reguler');
    `);
  }

  // Seed absensi data (only if absensi table is empty) - separate check
  const absenCount =
    (db.exec(`SELECT COUNT(*) FROM absensi`)[0]?.values[0][0] as number) ?? 0;
  if (absenCount === 0) {
    db.run(`INSERT INTO absensi (mahasiswa_id, shift_id, tanggal, waktu_absen, status, keterangan) VALUES
      (1, 1, '2026-02-24', '09:00:00', 'izin', 'Bekerja'),
      (2, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (3, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (4, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (5, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (6, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (7, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (8, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (9, 1, '2026-02-24', '09:00:00', 'izin', 'Bekerja'),
      (10, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (11, 1, '2026-02-24', '09:00:00', 'izin', 'Bekerja'),
      (12, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (13, 1, '2026-02-24', '09:00:00', 'hadir', NULL),
      (1, 2, '2026-02-24', '14:00:00', 'izin', 'Bekerja'),
      (2, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (3, 2, '2026-02-24', '14:00:00', 'izin', 'Bekerja'),
      (4, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (5, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (6, 2, '2026-02-24', '14:00:00', 'izin', 'Bekerja'),
      (7, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (8, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (9, 2, '2026-02-24', '14:00:00', 'izin', 'Bekerja'),
      (10, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (11, 2, '2026-02-24', '14:00:00', 'izin', 'Bekerja'),
      (12, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (13, 2, '2026-02-24', '14:00:00', 'hadir', NULL),
      (1, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (2, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (3, 3, '2026-02-24', '21:00:00', 'izin', 'Bekerja'),
      (4, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (5, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (6, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (7, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (8, 3, '2026-02-24', '21:00:00', 'izin', 'Bekerja'),
      (9, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (10, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (11, 3, '2026-02-24', '21:00:00', 'izin', 'Bekerja'),
      (12, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (13, 3, '2026-02-24', '21:00:00', 'hadir', NULL),
      (1, 1, '2026-02-25', '09:00:00', 'izin', 'Bekerja'),
      (2, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (3, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (4, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (5, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (6, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (7, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (8, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (9, 1, '2026-02-25', '09:00:00', 'izin', 'Bekerja'),
      (10, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (11, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (12, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (13, 1, '2026-02-25', '09:00:00', 'hadir', NULL),
      (1, 2, '2026-02-25', '14:00:00', 'izin', 'Bekerja'),
      (2, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (3, 2, '2026-02-25', '14:00:00', 'izin', 'Bekerja'),
      (4, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (5, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (6, 2, '2026-02-25', '14:00:00', 'izin', 'Bekerja'),
      (7, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (8, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (9, 2, '2026-02-25', '14:00:00', 'izin', 'Bekerja'),
      (10, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (11, 2, '2026-02-25', '14:00:00', 'izin', 'Bekerja'),
      (12, 2, '2026-02-25', '14:00:00', 'hadir', NULL),
      (13, 2, '2026-02-25', '14:00:00', 'izin', 'Mengambil perlengkapan di rumah');
    `);
  }

  persist();
}

/** Convert sql.js result rows to typed objects */
export function rowsToObjects<T>(
  result: { columns: string[]; values: (string | number | null)[][] }[],
): T[] {
  if (!result.length) return [];
  return result[0].values.map((row) => {
    const obj: Record<string, unknown> = {};
    result[0].columns.forEach((col, i) => (obj[col] = row[i]));
    return obj as T;
  });
}
