-- Fix RLS Policies for Absensi KKN
-- Run this in Supabase SQL Editor to fix permission issues

-- First, let's check current policies
SELECT tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Drop all existing policies for absensi table
DROP POLICY IF EXISTS "Allow insert absensi" ON absensi;
DROP POLICY IF EXISTS "Allow public read access" ON absensi;

-- Drop all existing policies for mahasiswa table  
DROP POLICY IF EXISTS "Allow public read access" ON mahasiswa;
DROP POLICY IF EXISTS "Allow insert mahasiswa" ON mahasiswa;

-- Drop all existing policies for settings table
DROP POLICY IF EXISTS "Allow public read access" ON settings;

-- Create new permissive policies

-- Mahasiswa: Allow SELECT and INSERT for everyone
CREATE POLICY "Enable all access for mahasiswa" ON mahasiswa
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Shift: Allow SELECT for everyone
CREATE POLICY "Enable read access for shift" ON shift
    FOR SELECT
    USING (true);

-- Absensi: Allow SELECT and INSERT for everyone
CREATE POLICY "Enable all access for absensi" ON absensi
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Settings: Allow SELECT for everyone
CREATE POLICY "Enable read access for settings" ON settings
    FOR SELECT
    USING (true);

-- Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
