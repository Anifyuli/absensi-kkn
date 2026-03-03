// src/lib/auth.ts
// Session management with Supabase integration

import type { Mahasiswa } from "@/lib/api";
import { checkAdmin as checkAdminApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "absensi_session_v1";

export function getSession(): Mahasiswa | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? (JSON.parse(s) as Mahasiswa) : null;
  } catch {
    return null;
  }
}

export function setSession(m: Mahasiswa): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(m));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Admin check menggunakan Supabase
export async function checkAdminStatus(nim: string): Promise<boolean> {
  try {
    return await checkAdminApi(nim);
  } catch {
    // Fallback to local check if Supabase fails
    const admins = getAdminList();
    return admins.includes(nim);
  }
}

export function isAdmin(m: Mahasiswa | null): boolean {
  // Check from session storage (set during login)
  if (!m) return false;
  try {
    const adminNims = localStorage.getItem("admin_list_cached");
    if (adminNims) {
      const admins = JSON.parse(adminNims);
      return admins.includes(m.nim);
    }
  } catch {
    // Fallback to default admin
    return m.nim === "202211017";
  }
  return false;
}

export function getAdminList(): string[] {
  try {
    const admins = localStorage.getItem("admin_list_cached");
    return admins ? JSON.parse(admins) : ["202211017"];
  } catch {
    return ["202211017"];
  }
}

export async function refreshAdminList(): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("settings")
      .select("key_value")
      .eq("key_name", "admin_list")
      .single();

    if (data) {
      const admins = JSON.parse(data.key_value);
      localStorage.setItem("admin_list_cached", JSON.stringify(admins));
      return admins;
    }
  } catch {
    // Use cached value
  }
  return getAdminList();
}

export function addAdmin(nim: string): boolean {
  const admins = getAdminList();
  if (admins.includes(nim)) return false;

  const newAdmins = [...admins, nim];
  try {
    localStorage.setItem("admin_list_cached", JSON.stringify(newAdmins));
    return true;
  } catch {
    return false;
  }
}

export function removeAdmin(nim: string): boolean {
  const admins = getAdminList();
  if (admins.length <= 1) {
    return false;
  }

  const newAdmins = admins.filter((a) => a !== nim);
  try {
    localStorage.setItem("admin_list_cached", JSON.stringify(newAdmins));
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(pwd: string): boolean {
  return pwd === "admin@2024";
}
