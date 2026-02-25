// src/components/ShiftCard.tsx

import type { ShiftConfig } from '@/lib/shifts'
import { getShiftColorClasses } from '@/lib/shifts'
import type { AbsensiRecord, StatusAbsen } from '@/db/absensi'

interface Props {
  config: ShiftConfig
  record: AbsensiRecord | undefined
  isActive: boolean
}

const STATUS_LABEL: Record<StatusAbsen, string> = {
  hadir: 'Hadir',
  izin: 'Izin',
}

export function ShiftCard({ config, record, isActive }: Props) {
  const colors = getShiftColorClasses(config.color)
  const isDone = !!record

  return (
    <div
      class={`
        relative overflow-hidden rounded-xl border p-4 transition-all duration-300
        ${isDone
          ? 'border-emerald-400/30 bg-emerald-400/5'
          : isActive
            ? `${colors.border} ${colors.bg} animate-glow-pulse ring-1 ring-inset ${colors.border}`
            : 'border-ink-700 bg-ink-800'
        }
      `}
    >
      {/* Top accent bar */}
      <div
        class={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 ${
          isDone ? 'bg-emerald-400' : isActive ? `bg-${config.color}-400` : 'bg-ink-700'
        }`}
      />

      <div class="flex items-start justify-between mb-3">
        <span class="text-2xl">{config.icon}</span>
        {isDone && (
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400/20 border border-emerald-400/40">
            <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </span>
        )}
        {isActive && !isDone && (
          <span class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span class="font-mono text-[10px] text-amber-400 uppercase tracking-wider">Aktif</span>
          </span>
        )}
      </div>

      <div class={`font-display font-bold text-base tracking-wide ${isDone ? 'text-white' : isActive ? colors.text : 'text-slate-400'}`}>
        {config.nama}
      </div>

      <div class="font-mono text-xs text-slate-500 mt-0.5">
        {config.jam} WIB
      </div>

      {isDone && record ? (
        <div class="mt-3 pt-3 border-t border-ink-700/50 space-y-1">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] text-slate-500">Absen</span>
            <span class="font-mono text-xs text-emerald-400 font-medium">{record.waktu_absen}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] text-slate-500">Status</span>
            <StatusBadge status={record.status} />
          </div>
        </div>
      ) : !isDone ? (
        <div class="mt-3 pt-3 border-t border-ink-700/50">
          <span class="font-mono text-[11px] text-slate-600 uppercase tracking-wider">
            {isActive ? 'Segera catat absensi' : 'Menunggu...'}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export function StatusBadge({ status }: { status: StatusAbsen }) {
  const classes: Record<StatusAbsen, string> = {
    hadir:     'badge-hadir',
    izin:      'badge-izin',
  }
  return (
    <span class={classes[status]}>
      {STATUS_LABEL[status]}
    </span>
  )
}
