// src/db/absensi.ts
// Menggunakan API backend instead of local sql.js

import {
  getTodayAbsensi,
  getAbsensiHistory,
  recordAbsensi as recordAbsensiApi,
  getAbsensiByTanggal as getAbsensiByTanggalApi,
  getAllAbsensi as getAllAbsensiApi,
  getDailySummary as getDailySummaryApi,
} from "@/lib/api";

export type StatusAbsen = "hadir" | "izin";

export interface AbsensiRecord {
  id: number;
  mahasiswa_id: number;
  shift_id: number;
  tanggal: string;
  waktu_absen: string | null;
  status: StatusAbsen;
  keterangan: string | null;
  // joined
  nama?: string;
  nim?: string;
  prodi?: string;
  kelas?: string;
  nama_shift?: string;
  jam_absen?: string;
}

export interface Shift {
  id: number;
  nama_shift: string;
  jam_absen: string;
}

export function getAllShifts(): Shift[] {
  // Shifts are static, return from config
  return [
    { id: 1, nama_shift: "Pagi", jam_absen: "09:00" },
    { id: 2, nama_shift: "Siang", jam_absen: "14:00" },
    { id: 3, nama_shift: "Malam", jam_absen: "21:00" },
  ];
}

export async function recordAbsensi(
  mahasiswaId: number,
  shiftId: number,
  status: StatusAbsen,
  waktuAbsen: string | null,
  keterangan?: string,
): Promise<boolean> {
  return recordAbsensiApi(mahasiswaId, shiftId, status, waktuAbsen, keterangan);
}

export async function getTodayAbsensiByMahasiswa(
  mahasiswaId: number,
): Promise<AbsensiRecord[]> {
  return getTodayAbsensi(mahasiswaId);
}

export async function getAbsensiByMahasiswa(
  mahasiswaId: number,
  limit = 60,
): Promise<AbsensiRecord[]> {
  return getAbsensiHistory(mahasiswaId, limit);
}

export async function getAbsensiByTanggal(
  tanggal: string,
): Promise<AbsensiRecord[]> {
  return getAbsensiByTanggalApi(tanggal);
}

export async function getAllAbsensi(): Promise<AbsensiRecord[]> {
  return getAllAbsensiApi();
}

export async function getDailySummary(
  tanggal: string,
): Promise<ReturnType<typeof getDailySummaryApi>> {
  return getDailySummaryApi(tanggal);
}

export function getLocalDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
