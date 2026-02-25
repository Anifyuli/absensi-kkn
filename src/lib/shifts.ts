// src/lib/shifts.ts

import type { StatusAbsen } from "@/db/absensi";

export interface ShiftConfig {
  id: 1 | 2 | 3;
  nama: string;
  icon: string;
  jam: string; // "09:00"
  hour: number;
  minute: number;
  color: string; // tailwind class fragment
  windowMinutes: number;
  startHour: number;
  endHour: number;
}

export const SHIFT_CONFIGS: ShiftConfig[] = [
  {
    id: 1,
    nama: "Pagi",
    icon: "🌅",
    jam: "09:00",
    hour: 9,
    minute: 0,
    color: "violet",
    windowMinutes: 240,
    startHour: 9,
    endHour: 14,
  },
  {
    id: 2,
    nama: "Siang",
    icon: "☀️",
    jam: "14:00",
    hour: 14,
    minute: 0,
    color: "amber",
    windowMinutes: 420,
    startHour: 14,
    endHour: 21,
  },
  {
    id: 3,
    nama: "Malam",
    icon: "🌙",
    jam: "21:00",
    hour: 21,
    minute: 0,
    color: "sky",
    windowMinutes: 780,
    startHour: 21,
    endHour: 24,
  },
];

export interface ActiveShift {
  config: ShiftConfig;
  status: StatusAbsen; // 'hadir' or 'izin'
  menitSelisih: number; // positive = late, negative = early
}

export function getActiveShift(now: Date): ActiveShift | null {
  const currentHour = now.getHours();

  // Check which shift is currently active based on time ranges
  for (const cfg of SHIFT_CONFIGS) {
    if (cfg.id === 3) {
      // Night shift: 21:00 - 08:59 (wraps to next day)
      if (currentHour >= cfg.startHour || currentHour < 9) {
        return { config: cfg, status: "hadir", menitSelisih: 0 };
      }
    } else if (currentHour >= cfg.startHour && currentHour < cfg.endHour) {
      // Day shifts: use their time ranges
      return { config: cfg, status: "hadir", menitSelisih: 0 };
    }
  }
  return null;
}

export interface NextShift {
  config: ShiftConfig;
  minutesUntil: number;
}

export function getNextShift(now: Date): NextShift {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const DAY = 24 * 60;

  return SHIFT_CONFIGS.map((cfg) => {
    const targetMins = cfg.hour * 60 + cfg.minute;
    let diff = targetMins - nowMins;
    if (diff < 0) diff += DAY;
    return { config: cfg, minutesUntil: diff };
  }).sort((a, b) => a.minutesUntil - b.minutesUntil)[0];
}

export function formatCountdown(minutes: number): string {
  if (minutes < 1) return "sebentar lagi";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

export function getShiftColorClasses(color: string): {
  badge: string;
  border: string;
  text: string;
  bg: string;
  dot: string;
} {
  const map: Record<
    string,
    { badge: string; border: string; text: string; bg: string; dot: string }
  > = {
    violet: {
      badge: "badge-shift-1",
      border: "border-violet-400/30",
      text: "text-violet-400",
      bg: "bg-violet-400/5",
      dot: "bg-violet-400",
    },
    amber: {
      badge: "badge-shift-2",
      border: "border-amber-400/30",
      text: "text-amber-400",
      bg: "bg-amber-400/5",
      dot: "bg-amber-400",
    },
    sky: {
      badge: "badge-shift-3",
      border: "border-sky-400/30",
      text: "text-sky-400",
      bg: "bg-sky-400/5",
      dot: "bg-sky-400",
    },
  };
  return map[color] ?? map["amber"];
}
