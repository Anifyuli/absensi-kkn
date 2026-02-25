// src/components/Toast.tsx

import { useApp } from '@/store'

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const COLORS: Record<string, string> = {
  success: 'border-emerald-400/40 bg-emerald-400/5 text-emerald-300',
  error: 'border-rose-400/40 bg-rose-400/5 text-rose-300',
  info: 'border-sky-400/40 bg-sky-400/5 text-sky-300',
  warning: 'border-amber-400/40 bg-amber-400/5 text-amber-300',
}

export function ToastContainer() {
  const { toasts, removeToast } = useApp()

  return (
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          class={`
            flex items-start gap-3 px-4 py-3 rounded-xl border
            font-body text-sm max-w-xs shadow-xl
            animate-slide-in pointer-events-auto cursor-pointer
            backdrop-blur-sm
            ${COLORS[toast.type]}
          `}
          onClick={() => removeToast(toast.id)}
        >
          <span class="font-mono font-bold text-base leading-none mt-0.5">
            {ICONS[toast.type]}
          </span>
          <span class="leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
