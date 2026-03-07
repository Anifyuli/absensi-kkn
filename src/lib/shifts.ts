// src/lib/shifts.ts

import type { StatusAbsen } from "@/db/absensi";

export interface ShiftConfig {
  id: 1 | 2 | 3;
  nama: string;
  icon: string;
  jam: string;
  hour: number;
  minute: number;
  color: string;
  windowMinutes: number;
  startHour: number;
  endHour: number; // untuk sesi malam: 9 (artinya wrap ke 08:59 hari berikutnya)
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
    endHour: 9, // wrap: berakhir pukul 08:59 hari berikutnya
  },
];

export interface ActiveShift {
  config: ShiftConfig;
  status: StatusAbsen;
  menitSelisih: number;
  tanggalSesi: Date; // tanggal logis sesi (bukan selalu tanggal sekarang)
}

export function getActiveShift(now: Date): ActiveShift | null {
  const currentHour = now.getHours();

  for (const cfg of SHIFT_CONFIGS) {
    let isActive = false;

    if (cfg.id === 3) {
      // Sesi malam melewati tengah malam: aktif 21:00 – 08:59
      isActive = currentHour >= cfg.startHour || currentHour < cfg.endHour;
    } else {
      // Sesi pagi & siang: range normal dalam satu hari
      isActive = currentHour >= cfg.startHour && currentHour < cfg.endHour;
    }

    if (isActive) {
      // Tentukan tanggal logis sesi:
      // Jika sesi malam dan jam masih dini hari (00:00–08:59),
      // tanggal sesi dianggap hari sebelumnya (saat sesi malam dimulai)
      const tanggalSesi = new Date(now);
      if (cfg.id === 3 && currentHour < cfg.endHour) {
        tanggalSesi.setDate(tanggalSesi.getDate() - 1);
      }
      tanggalSesi.setHours(0, 0, 0, 0);

      return {
        config: cfg,
        status: "hadir",
        menitSelisih: 0,
        tanggalSesi,
      };
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
