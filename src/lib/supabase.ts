// src/lib/supabase.ts
// Supabase client configuration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching Supabase schema
export interface Database {
  public: {
    Tables: {
      mahasiswa: {
        Row: {
          id: number;
          nim: string;
          nama: string;
          prodi: string;
          kelas: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          nim: string;
          nama: string;
          prodi?: string;
          kelas?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          nim?: string;
          nama?: string;
          prodi?: string;
          kelas?: string;
          created_at?: string;
        };
      };
      shift: {
        Row: {
          id: number;
          nama_shift: string;
          jam_absen: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          nama_shift: string;
          jam_absen: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          nama_shift?: string;
          jam_absen?: string;
          created_at?: string;
        };
      };
      absensi: {
        Row: {
          id: number;
          mahasiswa_id: number;
          shift_id: number;
          tanggal: string;
          waktu_absen: string | null;
          status: 'hadir' | 'izin';
          keterangan: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          mahasiswa_id: number;
          shift_id: number;
          tanggal: string;
          waktu_absen?: string | null;
          status: 'hadir' | 'izin';
          keterangan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          mahasiswa_id?: number;
          shift_id?: number;
          tanggal?: string;
          waktu_absen?: string | null;
          status?: 'hadir' | 'izin';
          keterangan?: string | null;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: number;
          key_name: string;
          key_value: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          key_name: string;
          key_value: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          key_name?: string;
          key_value?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: { user_nim: string };
        Returns: boolean;
      };
    };
  };
}
