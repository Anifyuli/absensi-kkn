// scripts/test-supabase.ts
// Test script untuk koneksi Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check connection
    console.log('📡 Test 1: Checking connection...');
    const { data: healthData, error: healthError } = await supabase
      .from('shift')
      .select('*')
      .limit(1);

    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      process.exit(1);
    }

    console.log('✅ Connection successful!\n');

    // Test 2: Check tables
    console.log('📊 Test 2: Checking tables...');
    
    const { count: mahasiswaCount } = await supabase
      .from('mahasiswa')
      .select('*', { count: 'exact', head: true });
    
    const { count: absensiCount } = await supabase
      .from('absensi')
      .select('*', { count: 'exact', head: true });
    
    const { data: shifts } = await supabase.from('shift').select('*');
    
    const { data: settings } = await supabase.from('settings').select('*');

    console.log('✅ Tables found:');
    console.log(`   - mahasiswa: ${mahasiswaCount || 0} records`);
    console.log(`   - absensi: ${absensiCount || 0} records`);
    console.log(`   - shift: ${shifts?.length || 0} records`);
    console.log(`   - settings: ${settings?.length || 0} records\n`);

    // Test 3: Check data
    console.log('📋 Test 3: Sample data...');
    if (mahasiswaCount && mahasiswaCount > 0) {
      const { data: sampleMhs } = await supabase
        .from('mahasiswa')
        .select('id, nim, nama')
        .limit(3);
      console.log('   Mahasiswa:', sampleMhs);
    }
    
    if (shifts && shifts.length > 0) {
      console.log('   Shifts:', shifts.map(s => s.nama_shift).join(', '));
    }

    console.log('\n✅ All tests passed! Supabase is ready to use.\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Common solutions:');
    console.error('   1. Make sure you ran supabase/schema.sql in SQL Editor');
    console.error('   2. Check if tables exist in Table Editor');
    console.error('   3. Verify your Supabase URL and Anon Key are correct');
    console.error('   4. Check if Row Level Security (RLS) is properly configured\n');
    process.exit(1);
  }
}

testConnection();
