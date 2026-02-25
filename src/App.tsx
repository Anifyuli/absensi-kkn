// src/App.tsx

import { useState, useEffect } from 'preact/hooks'
import { AppContext, useAppState } from '@/store'
import { initDatabase } from '@/db/database'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ToastContainer } from '@/components/Toast'

export function App() {
  const state = useAppState()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initDatabase()
      .then(() => setTimeout(() => setReady(true), 1200))
      .catch((err) => setError(String(err)))
  }, [])

  return (
    <AppContext.Provider value={state}>
      {!ready ? (
        <Splash error={error} />
      ) : (
        <>
          {state.user ? <DashboardPage /> : <LoginPage />}
          <ToastContainer />
        </>
      )}
    </AppContext.Provider>
  )
}

// ── Splash ───────────────────────────────────────────────────────────────────

function Splash({ error }: { error: string | null }) {
  return (
    <div class="fixed inset-0 bg-ink-950 grid-scan noise flex flex-col items-center justify-center gap-8">
      <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px]
                  bg-amber-400/8 blur-[80px] rounded-full pointer-events-none" />

      <div class="relative flex flex-col items-center gap-4 animate-fade-in">
        {/* Spinning hex */}
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 flex items-center justify-center
                      text-4xl text-amber-400 animate-spin-slow">
            ⬡
          </div>
          <div class="absolute inset-0 flex items-center justify-center
                      text-xl text-amber-400/60">
            ⬡
          </div>
        </div>

        <div>
          <h1 class="font-display font-black text-4xl tracking-[0.3em] text-white text-center uppercase">
            Absensi
          </h1>
          <p class="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-600 text-center mt-1">
            Memuat sistem...
          </p>
        </div>

        {error ? (
          <div class="px-4 py-2 rounded-lg bg-rose-400/10 border border-rose-400/20 text-rose-400 font-mono text-xs max-w-sm text-center">
            Error: {error}
          </div>
        ) : (
          <div class="w-40 h-0.5 bg-ink-700 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full animate-[load_1.2s_ease_forwards]" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes load {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  )
}
