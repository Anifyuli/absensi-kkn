// src/lib/api.ts
// API client using Supabase

import { supabase } from './supabase';

// Types
export interface Mahasiswa {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  kelas: string;
}

export interface AbsensiRecord {
  id: number;
  mahasiswa_id: number;
  shift_id: number;
  tanggal: string;
  waktu_absen: string | null;
  status: 'hadir' | 'izin';
  keterangan: string | null;
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

export interface DailySummary {
  total_mahasiswa: number;
  hadir: number;
  izin: number;
  per_shift: {
    shift_id: number;
    nama_shift: string;
    jam_absen: string;
    count: number;
  }[];
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(nim: string): Promise<Mahasiswa> {
  const { data, error } = await supabase
    .from('mahasiswa')
    .select('*')
    .eq('nim', nim)
    .single();

  if (error || !data) {
    throw new Error('NIM not found');
  }

  return data;
}

export async function register(
  nim: string,
  nama: string,
  prodi: string,
  kelas: string,
): Promise<Mahasiswa> {
  // Check if already exists
  const { data: existing } = await supabase
    .from('mahasiswa')
    .select('id')
    .eq('nim', nim)
    .single();

  if (existing) {
    throw new Error('NIM already registered');
  }

  const { data, error } = await supabase
    .from('mahasiswa')
    .insert({ nim, nama, prodi, kelas })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to register');
  }

  return data;
}

export async function checkAdmin(nim: string): Promise<boolean> {
  const { data } = await supabase
    .from('settings')
    .select('key_value')
    .eq('key_name', 'admin_list')
    .single();

  if (!data) return false;

  try {
    const adminList = JSON.parse(data.key_value) as string[];
    return adminList.includes(nim);
  } catch {
    return false;
  }
}

// ── Absensi ──────────────────────────────────────────────────────────────────

export async function getTodayAbsensi(
  mahasiswaId: number,
): Promise<AbsensiRecord[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('absensi')
    .select(`
      *,
      shift:shift_id (
        nama_shift,
        jam_absen
      )
    `)
    .eq('mahasiswa_id', mahasiswaId)
    .eq('tanggal', today)
    .order('shift_id');

  if (error) {
    console.error('Error fetching today absensi:', error);
    return [];
  }

  return (data || []).map((record) => ({
    ...record,
    nama_shift: (record.shift as any)?.nama_shift,
    jam_absen: (record.shift as any)?.jam_absen,
  })) as AbsensiRecord[];
}

export async function getAbsensiHistory(
  mahasiswaId: number,
  limit = 60,
): Promise<AbsensiRecord[]> {
  const { data, error } = await supabase
    .from('absensi')
    .select(`
      *,
      shift:shift_id (
        nama_shift,
        jam_absen
      )
    `)
    .eq('mahasiswa_id', mahasiswaId)
    .order('tanggal', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching absensi history:', error);
    return [];
  }

  return (data || []).map((record) => ({
    ...record,
    nama_shift: (record.shift as any)?.nama_shift,
    jam_absen: (record.shift as any)?.jam_absen,
  })) as AbsensiRecord[];
}

export async function recordAbsensi(
  mahasiswa_id: number,
  shift_id: number,
  status: 'hadir' | 'izin',
  waktu_absen: string | null,
  keterangan?: string,
): Promise<boolean> {
  // Get local date from client
  const now = new Date();
  const tanggal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Format waktu_absen as HH:MM:SS for PostgreSQL TIME type
  let formattedWaktuAbsen: string | null = null;
  if (waktu_absen) {
    // Handle both "HH:mm:ss" and "HH.mm.ss" formats
    formattedWaktuAbsen = waktu_absen.replace(/\./g, ':');
  }

  try {
    const { error } = await supabase.from('absensi').insert({
      mahasiswa_id,
      shift_id,
      status,
      waktu_absen: formattedWaktuAbsen,
      keterangan,
      tanggal,
    });

    if (error) {
      console.error('Error recording absensi:', error);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function getAbsensiByTanggal(
  tanggal: string,
): Promise<AbsensiRecord[]> {
  const { data, error } = await supabase
    .from('absensi')
    .select(`
      *,
      mahasiswa:mahasiswa_id (
        nama,
        nim,
        prodi,
        kelas
      ),
      shift:shift_id (
        nama_shift,
        jam_absen
      )
    `)
    .eq('tanggal', tanggal)
    .order('tanggal', { ascending: false })
    .order('shift_id');

  if (error) {
    console.error('Error fetching absensi by tanggal:', error);
    return [];
  }

  return (data || []).map((record) => ({
    ...record,
    nama: (record.mahasiswa as any)?.nama,
    nim: (record.mahasiswa as any)?.nim,
    prodi: (record.mahasiswa as any)?.prodi,
    kelas: (record.mahasiswa as any)?.kelas,
    nama_shift: (record.shift as any)?.nama_shift,
    jam_absen: (record.shift as any)?.jam_absen,
  })) as AbsensiRecord[];
}

export async function getAllAbsensi(): Promise<AbsensiRecord[]> {
  const { data, error } = await supabase
    .from('absensi')
    .select(`
      *,
      mahasiswa:mahasiswa_id (
        nama,
        nim,
        prodi,
        kelas
      ),
      shift:shift_id (
        nama_shift,
        jam_absen
      )
    `)
    .order('tanggal', { ascending: false })
    .order('shift_id');

  if (error) {
    console.error('Error fetching all absensi:', error);
    return [];
  }

  return (data || []).map((record) => ({
    ...record,
    nama: (record.mahasiswa as any)?.nama,
    nim: (record.mahasiswa as any)?.nim,
    prodi: (record.mahasiswa as any)?.prodi,
    kelas: (record.mahasiswa as any)?.kelas,
    nama_shift: (record.shift as any)?.nama_shift,
    jam_absen: (record.shift as any)?.jam_absen,
  })) as AbsensiRecord[];
}

export async function getDailySummary(tanggal: string): Promise<DailySummary> {
  // Get total mahasiswa
  const { count: totalMahasiswa } = await supabase
    .from('mahasiswa')
    .select('*', { count: 'exact', head: true });

  // Get absensi for the date
  const { data: absensiHariIni } = await supabase
    .from('absensi')
    .select('status, shift_id')
    .eq('tanggal', tanggal);

  const hadir = absensiHariIni?.filter((a) => a.status === 'hadir').length || 0;
  const izin = absensiHariIni?.filter((a) => a.status === 'izin').length || 0;

  // Get all shifts
  const { data: shifts } = await supabase.from('shift').select('*');

  const perShift = (shifts || []).map((shift) => {
    const count =
      absensiHariIni?.filter(
        (a) => a.shift_id === shift.id && a.status === 'hadir',
      ).length || 0;
    return {
      shift_id: shift.id,
      nama_shift: shift.nama_shift,
      jam_absen: shift.jam_absen,
      count,
    };
  });

  return {
    total_mahasiswa: totalMahasiswa || 0,
    hadir,
    izin,
    per_shift: perShift,
  };
}

export async function getAllMahasiswa(): Promise<Mahasiswa[]> {
  const { data, error } = await supabase
    .from('mahasiswa')
    .select('*')
    .order('nama');

  if (error) {
    console.error('Error fetching mahasiswa:', error);
    return [];
  }

  return data || [];
}

// ── Health Check ─────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{
  status: string;
  timestamp: string;
}> {
  // Check Supabase connection by querying a simple table
  const { error } = await supabase.from('shift').select('id').limit(1);

  if (error) {
    throw new Error('Supabase connection failed');
  }

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
