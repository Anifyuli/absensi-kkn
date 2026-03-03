-- Absensi KKN Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: mahasiswa
-- ============================================
CREATE TABLE IF NOT EXISTS mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    prodi VARCHAR(100) DEFAULT 'Informatika',
    kelas VARCHAR(50) DEFAULT 'Reguler',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABLE: shift
-- ============================================
CREATE TABLE IF NOT EXISTS shift (
    id SERIAL PRIMARY KEY,
    nama_shift VARCHAR(50) NOT NULL,
    jam_absen TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- TABLE: absensi
-- ============================================
CREATE TABLE IF NOT EXISTS absensi (
    id SERIAL PRIMARY KEY,
    mahasiswa_id INTEGER NOT NULL REFERENCES mahasiswa(id) ON DELETE CASCADE,
    shift_id INTEGER NOT NULL REFERENCES shift(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu_absen TIME,
    status VARCHAR(20) NOT NULL CHECK (status IN ('hadir', 'izin')),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(mahasiswa_id, shift_id, tanggal)
);

-- ============================================
-- TABLE: settings
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON mahasiswa(nim);
CREATE INDEX IF NOT EXISTS idx_absensi_mahasiswa ON absensi(mahasiswa_id);
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal ON absensi(tanggal);
CREATE INDEX IF NOT EXISTS idx_absensi_mahasiswa_tanggal ON absensi(mahasiswa_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE mahasiswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Mahasiswa: Allow public read access (for authentication)
CREATE POLICY "Allow public read access" ON mahasiswa
    FOR SELECT USING (true);

-- Mahasiswa: Allow insert (for registration)
CREATE POLICY "Allow insert mahasiswa" ON mahasiswa
    FOR INSERT WITH CHECK (true);

-- Shift: Allow public read access
CREATE POLICY "Allow public read access" ON shift
    FOR SELECT USING (true);

-- Absensi: Allow public read access
CREATE POLICY "Allow public read access" ON absensi
    FOR SELECT USING (true);

-- Absensi: Allow insert (for recording attendance)
CREATE POLICY "Allow insert absensi" ON absensi
    FOR INSERT WITH CHECK (true);

-- Settings: Allow public read access
CREATE POLICY "Allow public read access" ON settings
    FOR SELECT USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default shifts
INSERT INTO shift (nama_shift, jam_absen) VALUES
    ('Pagi', '09:00:00'),
    ('Siang', '14:00:00'),
    ('Malam', '21:00:00')
ON CONFLICT DO NOTHING;

-- Insert default admin settings
INSERT INTO settings (key_name, key_value) VALUES
    ('admin_password', 'admin@2024'),
    ('admin_list', '["202211017"]')
ON CONFLICT (key_name) DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_nim TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    admin_list TEXT;
BEGIN
    SELECT key_value INTO admin_list FROM settings WHERE key_name = 'admin_list';
    RETURN admin_list LIKE '%' || user_nim || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
