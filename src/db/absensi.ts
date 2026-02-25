// src/db/absensi.ts

import { getDb, persist, rowsToObjects } from './database'

export type StatusAbsen = 'hadir' | 'izin'

export interface AbsensiRecord {
  id: number
  mahasiswa_id: number
  shift_id: number
  tanggal: string
  waktu_absen: string | null
  status: StatusAbsen
  keterangan: string | null
  // joined
  nama?: string
  nim?: string
  prodi?: string
  kelas?: string
  nama_shift?: string
  jam_absen?: string
}

export interface Shift {
  id: number
  nama_shift: string
  jam_absen: string
}

export function getAllShifts(): Shift[] {
  return rowsToObjects<Shift>(getDb().exec(`SELECT * FROM shift ORDER BY id`))
}

export function recordAbsensi(
  mahasiswaId: number,
  shiftId: number,
  status: StatusAbsen,
  waktuAbsen: string | null,
  keterangan?: string
): boolean {
  const tanggal = getLocalDate()
  try {
    getDb().run(
      `INSERT INTO absensi (mahasiswa_id, shift_id, tanggal, waktu_absen, status, keterangan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mahasiswaId, shiftId, tanggal, waktuAbsen, status, keterangan ?? null]
    )
    persist()
    return true
  } catch {
    return false // likely UNIQUE conflict = already recorded
  }
}

export function getTodayAbsensiByMahasiswa(mahasiswaId: number): AbsensiRecord[] {
  const tanggal = getLocalDate()
  return rowsToObjects<AbsensiRecord>(
    getDb().exec(
      `SELECT a.*, s.nama_shift, s.jam_absen
       FROM absensi a
       JOIN shift s ON s.id = a.shift_id
       WHERE a.mahasiswa_id = ? AND a.tanggal = ?
       ORDER BY a.shift_id`,
      [mahasiswaId, tanggal]
    )
  )
}

export function getAbsensiByMahasiswa(mahasiswaId: number, limit = 60): AbsensiRecord[] {
  return rowsToObjects<AbsensiRecord>(
    getDb().exec(
      `SELECT a.*, s.nama_shift, s.jam_absen
       FROM absensi a
       JOIN shift s ON s.id = a.shift_id
       WHERE a.mahasiswa_id = ?
       ORDER BY a.tanggal DESC, a.shift_id ASC
       LIMIT ?`,
      [mahasiswaId, limit]
    )
  )
}

export function getAbsensiByTanggal(tanggal: string): AbsensiRecord[] {
  return rowsToObjects<AbsensiRecord>(
    getDb().exec(
      `SELECT a.*, m.nama, m.nim, m.prodi, m.kelas, s.nama_shift, s.jam_absen
       FROM absensi a
       JOIN mahasiswa m ON m.id = a.mahasiswa_id
       JOIN shift s ON s.id = a.shift_id
       WHERE a.tanggal = ?
       ORDER BY m.nama, a.shift_id`,
      [tanggal]
    )
  )
}

export function getAllAbsensi(): AbsensiRecord[] {
  return rowsToObjects<AbsensiRecord>(
    getDb().exec(
      `SELECT a.*, m.nama, m.nim, m.prodi, m.kelas, s.nama_shift, s.jam_absen
       FROM absensi a
       JOIN mahasiswa m ON m.id = a.mahasiswa_id
       JOIN shift s ON s.id = a.shift_id
       ORDER BY a.tanggal DESC, m.nama, a.shift_id`
    )
  )
}

export interface DailySummary {
  total_mahasiswa: number
  hadir: number
  izin: number
  per_shift: { shift_id: number; nama_shift: string; jam_absen: string; count: number }[]
}

export function getDailySummary(tanggal: string): DailySummary {
  const db = getDb()

  const totalRow = db.exec(`SELECT COUNT(*) FROM mahasiswa`)[0]?.values[0][0] as number ?? 0

  const statRows = rowsToObjects<{ status: StatusAbsen; cnt: number }>(
    db.exec(
      `SELECT status, COUNT(*) as cnt FROM absensi WHERE tanggal = ? GROUP BY status`,
      [tanggal]
    )
  )

  const perShift = rowsToObjects<{ shift_id: number; nama_shift: string; jam_absen: string; count: number }>(
    db.exec(
      `SELECT a.shift_id, s.nama_shift, s.jam_absen, COUNT(*) as count
       FROM absensi a JOIN shift s ON s.id = a.shift_id
       WHERE a.tanggal = ? AND a.status = 'hadir'
       GROUP BY a.shift_id`,
      [tanggal]
    )
  )

  const summ: DailySummary = {
    total_mahasiswa: totalRow,
    hadir: 0, izin: 0,
    per_shift: perShift,
  }
  for (const r of statRows) {
    summ[r.status] = Number(r.cnt)
  }
  return summ
}

export function getLocalDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
