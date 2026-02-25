// src/lib/auth.ts

import type { Mahasiswa } from '@/db/mahasiswa'

const SESSION_KEY = 'absensi_session_v1'
const ADMIN_PWD = 'admin@2024'

export function getSession(): Mahasiswa | null {
  try {
    const s = localStorage.getItem(SESSION_KEY)
    return s ? (JSON.parse(s) as Mahasiswa) : null
  } catch {
    return null
  }
}

export function setSession(m: Mahasiswa): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(m))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function isAdmin(m: Mahasiswa | null): boolean {
  // Admin logic: check if NIM is in admin list
  const admins = getAdminList()
  return !!m?.nim && admins.includes(m.nim)
}

// Admin management functions
export function getAdminList(): string[] {
  // In real implementation, this would come from database
  // For now, we'll use localStorage
  try {
    const admins = localStorage.getItem('admin_list')
    return admins ? JSON.parse(admins) : ['202211017']
  } catch {
    return ['202211017']
  }
}

export function addAdmin(nim: string): boolean {
  const admins = getAdminList()
  if (admins.includes(nim)) return false // Already admin
  
  const newAdmins = [...admins, nim]
  try {
    localStorage.setItem('admin_list', JSON.stringify(newAdmins))
    return true
  } catch {
    return false
  }
}

export function removeAdmin(nim: string): boolean {
  const admins = getAdminList()
  if (admins.length <= 1) {
    return false // Cannot remove last admin
  }
  
  const newAdmins = admins.filter(a => a !== nim)
  try {
    localStorage.setItem('admin_list', JSON.stringify(newAdmins))
    return true
  } catch {
    return false
  }
}

export function verifyAdminPassword(pwd: string): boolean {
  return pwd === ADMIN_PWD
}
