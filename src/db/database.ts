// src/db/database.ts
// Database layer menggunakan API backend instead of sql.js + localStorage

import { checkHealth } from "@/lib/api";

let _initialized = false;
let _initError: string | null = null;

export async function initDatabase(): Promise<void> {
  if (_initialized) return;

  try {
    await checkHealth();
    _initialized = true;
    _initError = null;
    console.log("✓ Connected to API server");
  } catch (err) {
    _initError = err instanceof Error ? err.message : "Connection failed";
    console.error("✗ Failed to connect to API server:", _initError);
    throw new Error(_initError);
  }
}

export function getDb(): null {
  // No longer using local sql.js
  return null;
}

export function persist(): void {
  // No longer needed - data is persisted on server
}

export function rowsToObjects<T>(result: any[]): T[] {
  // No longer needed - API returns objects directly
  return result || [];
}

export function isInitialized(): boolean {
  return _initialized;
}

export function getInitError(): string | null {
  return _initError;
}
