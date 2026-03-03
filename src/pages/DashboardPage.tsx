// src/pages/DashboardPage.tsx

import { useState, useCallback, useEffect } from "preact/hooks";
import { Clock, useLiveClock } from "@/components/Clock";
import { ShiftCard, StatusBadge } from "@/components/ShiftCard";
import {
  SHIFT_CONFIGS,
  getActiveShift,
  getNextShift,
  formatCountdown,
  getShiftColorClasses,
} from "@/lib/shifts";
import {
  recordAbsensi,
  getTodayAbsensiByMahasiswa,
  getAbsensiByMahasiswa,
  getLocalDate,
  type AbsensiRecord,
  type StatusAbsen,
} from "@/db/absensi";
import { useApp } from "@/store";
import { isAdmin, refreshAdminList } from "@/lib/auth";
import { AdminPage } from "./AdminPage";

type Tab = "absensi" | "riwayat" | "admin";

export function DashboardPage() {
  const { user, logout, addToast } = useApp();
  const [tab, setTab] = useState<Tab>("absensi");
  const [admin, setAdmin] = useState(false);
  const [tick, setTick] = useState(0); // force refresh

  // Check admin status on mount
  useEffect(() => {
    if (user) {
      refreshAdminList().then(() => {
        setAdmin(isAdmin(user));
      });
    }
  }, [user]);

  return (
    <div class="min-h-screen bg-ink-950">
      {/* Ambient top glow */}
      <div class="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div class="max-w-3xl mx-auto px-4 pb-20">
        {/* ── Header ── */}
        <header class="flex items-center justify-between py-4 border-b border-ink-700/50">
          <div class="flex items-center gap-3">
            <span class="text-amber-400 font-mono text-lg">⬡</span>
            <span class="font-display font-black text-lg tracking-widest uppercase text-white">
              Absensi
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <div class="font-body font-medium text-sm text-white">
                {user?.nama}
              </div>
              <div class="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                {user?.nim} · {admin ? "Admin" : user?.prodi}
              </div>
            </div>
            <button onClick={logout} class="btn-ghost text-xs py-1.5 px-3">
              Keluar
            </button>
          </div>
        </header>

        {/* ── Clock ── */}
        <Clock />

        {/* ── Tabs ── */}
        <div class="flex gap-1.5 mb-6">
          <button
            class={`tab-pill ${tab === "absensi" ? "active" : ""}`}
            onClick={() => setTab("absensi")}
          >
            ◉ Absensi
          </button>
          <button
            class={`tab-pill ${tab === "riwayat" ? "active" : ""}`}
            onClick={() => setTab("riwayat")}
          >
            ☰ Riwayat
          </button>
          {admin && (
            <button
              class={`tab-pill ${tab === "admin" ? "active" : ""}`}
              onClick={() => setTab("admin")}
            >
              ⚙ Admin
            </button>
          )}
        </div>

        {/* ── Tab Content ── */}
        {tab === "absensi" && (
          <AbsensiTab key={tick} onRefresh={() => setTick((t) => t + 1)} />
        )}
        {tab === "riwayat" && <RiwayatTab />}
        {tab === "admin" && admin && <AdminPage />}
      </div>
    </div>
  );
}

// ── Absensi Tab ──────────────────────────────────────────────────────────────

function AbsensiTab({ onRefresh }: { onRefresh: () => void }) {
  const { user, addToast } = useApp();
  const now = useLiveClock();
  const [todayRecords, setTodayRecords] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch today's absensi
  useEffect(() => {
    if (user) {
      getTodayAbsensiByMahasiswa(user.id)
        .then(setTodayRecords)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, now.getMinutes()]); // Refresh every minute

  const activeShift = getActiveShift(now);
  const nextShift = getNextShift(now);

  const todayRecordMap = new Map(todayRecords.map((r) => [r.shift_id, r]));
  const alreadyCheckedIn = activeShift
    ? todayRecordMap.has(activeShift.config.id)
    : false;
  const [izinMode, setIzinMode] = useState(false);
  const [keterangan, setKeterangan] = useState("");

  async function handleCheckin(status: StatusAbsen = "hadir") {
    if (!activeShift || !user) return;
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const finalKeterangan = status === "izin" ? keterangan.trim() : undefined;
    const ok = await recordAbsensi(
      user.id,
      activeShift.config.id,
      status,
      timeStr,
      finalKeterangan,
    );
    if (ok) {
      addToast(
        `✓ Absensi ${activeShift.config.nama} berhasil dicatat sebagai ${status}!`,
        "success",
      );
      onRefresh();
      setIzinMode(false);
      setKeterangan("");
      // Refresh records
      getTodayAbsensiByMahasiswa(user.id).then(setTodayRecords);
      // Trigger refresh for Riwayat tab
      window.dispatchEvent(new CustomEvent("refresh-riwayat"));
    } else {
      addToast("Absensi sudah pernah dicatat untuk shift ini.", "warning");
    }
  }

  if (loading) {
    return (
      <div class="card p-12 text-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div class="space-y-6 animate-fade-up">
      {/* Shift Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SHIFT_CONFIGS.map((cfg) => (
          <ShiftCard
            key={cfg.id}
            config={cfg}
            record={todayRecordMap.get(cfg.id)}
            isActive={activeShift?.config.id === cfg.id}
          />
        ))}
      </div>

      {/* Check-in Panel */}
      {activeShift && !alreadyCheckedIn ? (
        <CheckinPanel
          shift={activeShift}
          onCheckin={handleCheckin}
          izinMode={izinMode}
          setIzinMode={setIzinMode}
          keterangan={keterangan}
          setKeterangan={setKeterangan}
        />
      ) : activeShift && alreadyCheckedIn ? (
        <AlreadyCheckedPanel shiftName={activeShift.config.nama} />
      ) : (
        <NextShiftPanel next={nextShift} />
      )}

      {/* Today's summary */}
      {todayRecords.length > 0 && <TodaySummary records={todayRecords} />}
    </div>
  );
}

function CheckinPanel({
  shift,
  onCheckin,
  izinMode,
  setIzinMode,
  keterangan,
  setKeterangan,
}: {
  shift: ReturnType<typeof getActiveShift>;
  onCheckin: (status: StatusAbsen) => void;
  izinMode: boolean;
  setIzinMode: (mode: boolean) => void;
  keterangan: string;
  setKeterangan: (ket: string) => void;
}) {
  if (!shift) return null;
  const colors = getShiftColorClasses(shift.config.color);

  return (
    <div
      class={`rounded-xl border p-5 text-center ${colors.border} ${colors.bg} animate-glow-pulse`}
    >
      <div class="text-4xl mb-2">{shift.config.icon}</div>
      <div
        class={`font-display font-bold text-xl tracking-wide mb-1 ${colors.text}`}
      >
        {shift.config.nama.toUpperCase()} — WAKTU ABSEN!
      </div>
      <p class="font-body text-sm text-slate-400 mb-4">
        {shift.menitSelisih < 0
          ? `${Math.abs(shift.menitSelisih)} menit lebih awal`
          : "Waktu absen — catat sekarang!"}
      </p>

      {!izinMode ? (
        <div class="space-y-3">
          <button
            onClick={() => onCheckin("hadir")}
            class="btn-primary text-base px-8 py-3.5 font-black tracking-widest w-full"
          >
            HADIR
          </button>
          <button
            onClick={() => setIzinMode(true)}
            class="btn-blue text-base px-8 py-3.5 font-black tracking-widest w-full"
          >
            IZIN
          </button>
        </div>
      ) : (
        <div class="space-y-3">
          <div class="text-left">
            <label class="label block mb-1">Keterangan Izin</label>
            <textarea
              class="input-base h-20 resize-none"
              placeholder="Alasan izin (misal: sakit, bekerja, dll)"
              value={keterangan}
              onInput={(e) =>
                setKeterangan((e.target as HTMLTextAreaElement).value)
              }
            />
          </div>
          <div class="flex gap-2">
            <button
              onClick={() => onCheckin("izin")}
              disabled={!keterangan.trim()}
              class="btn-blue flex-1 text-base px-6 py-3.5 font-black tracking-widest"
            >
              ◉ KIRIM IZIN
            </button>
            <button
              onClick={() => setIzinMode(false)}
              class="btn-ghost flex-1 border-rose-400/30 text-rose-400 hover:bg-rose-400/10 text-base py-3.5"
            >
              BATAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AlreadyCheckedPanel({ shiftName }: { shiftName: string }) {
  return (
    <div class="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">
      <div class="flex items-center justify-center gap-3">
        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/30">
          <span class="text-emerald-400 font-mono font-bold">✓</span>
        </span>
        <div>
          <div class="font-body font-medium text-emerald-300">
            Absensi {shiftName} sudah tercatat
          </div>
          <div class="font-mono text-xs text-slate-500 mt-0.5">
            Sampai jumpa di shift berikutnya!
          </div>
        </div>
      </div>
    </div>
  );
}

function NextShiftPanel({ next }: { next: ReturnType<typeof getNextShift> }) {
  return (
    <div class="rounded-xl border border-ink-700 bg-ink-800 p-5">
      <div class="flex items-center justify-between">
        <div>
          <div class="label mb-1">Tidak Ada Shift Aktif</div>
          <div class="font-body text-sm text-slate-300">
            {next.config.icon}{" "}
            <span class="font-medium">{next.config.nama}</span> (
            {next.config.jam} WIB)
          </div>
        </div>
        <div class="text-right">
          <div class="label mb-1">Mulai dalam</div>
          <div class="font-mono text-lg font-semibold text-amber-400">
            {formatCountdown(next.minutesUntil)}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodaySummary({ records }: { records: AbsensiRecord[] }) {
  return (
    <div class="card p-4">
      <div class="label mb-3">Rekap Hari Ini — {getLocalDate()}</div>
      <div class="space-y-2">
        {records.map((r) => {
          const shiftCfg = SHIFT_CONFIGS.find((s) => s.id === r.shift_id);
          return (
            <div
              key={r.id}
              class="flex items-center justify-between py-2 border-b border-ink-700/50 last:border-0"
            >
              <div class="flex items-center gap-2">
                {shiftCfg && <span class="text-base">{shiftCfg.icon}</span>}
                <span class="font-body text-sm text-white">{r.nama_shift}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-xs text-slate-400">
                  {r.waktu_absen}
                </span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Riwayat Tab ──────────────────────────────────────────────────────────────

function RiwayatTab() {
  const { user } = useApp();
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      getAbsensiByMahasiswa(user.id, 90)
        .then(setRecords)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, refreshTrigger]);

  // Expose refresh function via custom event
  useEffect(() => {
    const handleRefresh = () => setRefreshTrigger((t) => t + 1);
    window.addEventListener("refresh-riwayat", handleRefresh);
    return () => window.removeEventListener("refresh-riwayat", handleRefresh);
  }, []);

  // Group by date
  const grouped = records.reduce<Record<string, AbsensiRecord[]>>((acc, r) => {
    if (!acc[r.tanggal]) acc[r.tanggal] = [];
    acc[r.tanggal].push(r);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div class="animate-fade-up space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="section-title">Riwayat Absensi</div>
          <div class="font-mono text-xs text-slate-500 mt-0.5">
            {user?.nama} · {user?.nim}
          </div>
        </div>
        <div class="font-mono text-xs text-slate-600">
          {records.length} catatan
        </div>
      </div>

      {loading ? (
        <div class="card p-12 text-center">
          <Spinner />
        </div>
      ) : dates.length === 0 ? (
        <EmptyState icon="📋" message="Belum ada riwayat absensi." />
      ) : (
        dates.map((date) => (
          <div key={date} class="card overflow-hidden">
            <div class="px-4 py-2.5 bg-ink-900/60 border-b border-ink-700/50">
              <span class="font-mono text-xs text-slate-400">
                {formatDisplayDate(date)}
              </span>
            </div>
            <div class="divide-y divide-ink-700/40">
              {grouped[date].map((r) => (
                <div
                  key={r.id}
                  class="flex items-center justify-between px-4 py-3"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-lg">
                      {SHIFT_CONFIGS.find((s) => s.id === r.shift_id)?.icon ??
                        "⏰"}
                    </span>
                    <div>
                      <div class="font-body text-sm text-white font-medium">
                        {r.nama_shift}
                      </div>
                      <div class="font-mono text-[10px] text-slate-500">
                        {r.jam_absen} WIB
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-right">
                    <span class="font-mono text-xs text-slate-400">
                      {r.waktu_absen ?? "—"}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Utils ────────────────────────────────────────────────────────────────────

function formatDisplayDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div class="card p-12 text-center">
      <div class="text-4xl mb-3 opacity-40">{icon}</div>
      <div class="font-mono text-xs text-slate-600 uppercase tracking-widest">
        {message}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg class="animate-spin w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none">
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
