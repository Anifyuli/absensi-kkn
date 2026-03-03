// src/db/mahasiswa.ts
// Menggunakan API backend instead of local sql.js

import { getAllMahasiswa as getAllMahasiswaApi, register } from "@/lib/api";

export interface Mahasiswa {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  kelas: string;
}

export async function createMahasiswa(
  nim: string,
  nama: string,
  prodi: string,
  kelas: string,
): Promise<Mahasiswa | null> {
  try {
    return await register(nim, nama, prodi, kelas);
  } catch {
    return null;
  }
}

export async function getMahasiswaByNim(
  nim: string,
): Promise<Mahasiswa | null> {
  // Need to fetch all and find (or add API endpoint)
  // For now, we'll use login endpoint indirectly
  // This is used in LoginPage, we'll handle it there
  throw new Error("Use login API directly instead");
}

export async function getMahasiswaById(id: number): Promise<Mahasiswa | null> {
  // Get all mahasiswa and find by ID
  // This is not efficient but avoids adding another API endpoint
  const all = await getAllMahasiswa();
  return all.find((m) => m.id === id) || null;
}

export async function getAllMahasiswa(): Promise<Mahasiswa[]> {
  return getAllMahasiswaApi();
}

export async function countMahasiswa(): Promise<number> {
  const all = await getAllMahasiswa();
  return all.length;
}
