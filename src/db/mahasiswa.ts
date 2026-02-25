// src/db/mahasiswa.ts

import { getDb, persist, rowsToObjects } from './database'

export interface Mahasiswa {
  id: number
  nim: string
  nama: string
  prodi: string
  kelas: string
}

export function createMahasiswa(
  nim: string,
  nama: string,
  prodi: string,
  kelas: string
): Mahasiswa | null {
  try {
    getDb().run(
      `INSERT INTO mahasiswa (nim, nama, prodi, kelas) VALUES (?, ?, ?, ?)`,
      [nim, nama, prodi, kelas]
    )
    persist()
    return getMahasiswaByNim(nim)
  } catch {
    return null
  }
}

export function getMahasiswaByNim(nim: string): Mahasiswa | null {
  const rows = rowsToObjects<Mahasiswa>(
    getDb().exec(`SELECT * FROM mahasiswa WHERE nim = ? LIMIT 1`, [nim])
  )
  return rows[0] ?? null
}

export function getMahasiswaById(id: number): Mahasiswa | null {
  const rows = rowsToObjects<Mahasiswa>(
    getDb().exec(`SELECT * FROM mahasiswa WHERE id = ? LIMIT 1`, [id])
  )
  return rows[0] ?? null
}

export function getAllMahasiswa(): Mahasiswa[] {
  return rowsToObjects<Mahasiswa>(
    getDb().exec(`SELECT * FROM mahasiswa ORDER BY nama`)
  )
}

export function countMahasiswa(): number {
  const res = getDb().exec(`SELECT COUNT(*) as c FROM mahasiswa`)
  return (res[0]?.values[0][0] as number) ?? 0
}
