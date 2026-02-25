// src/components/Clock.tsx

import { useState, useEffect } from 'preact/hooks'
import { getLocalDate } from '@/db/absensi'

export function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  const ss = String(time.getSeconds()).padStart(2, '0')

  const dateStr = time.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div class="text-center py-6 select-none">
      <div class="relative inline-block">
        {/* Background glow orb */}
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-48 h-12 bg-amber-400/10 blur-2xl rounded-full" />
        </div>

        <div class="relative font-mono font-semibold tracking-tight text-shadow-amber leading-none"
             style={{ fontSize: 'clamp(3rem, 12vw, 6.5rem)', color: '#f5a623' }}>
          {hh}
          <span class="opacity-60 animate-pulse-slow mx-0.5">:</span>
          {mm}
          <span class="opacity-60 animate-pulse-slow mx-0.5">:</span>
          <span class="opacity-80">{ss}</span>
        </div>
      </div>

      <div class="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
        {dateStr}
      </div>
    </div>
  )
}

/** Hook that re-renders every second — use in shift-aware components */
export function useLiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}
