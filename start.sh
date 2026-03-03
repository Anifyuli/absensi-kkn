#!/bin/bash
# Start frontend development server

echo "🚀 Starting Absensi KKN Development Server..."

# Kill any existing processes on common ports
lsof -ti:3000,3001,3002,5173 2>/dev/null | xargs kill -9 2>/dev/null || true

echo ""
echo "📋 Before starting, make sure:"
echo "   1. .env file exists with Supabase credentials"
echo "   2. Supabase database is set up (run supabase/schema.sql)"
echo "   3. Data is migrated (run: pnpm migrate)"
echo ""

# Start frontend
echo "🎨 Starting development server..."
cd "$(dirname "$0")"
pnpm dev

echo ""
echo "✅ Server stopped!"
