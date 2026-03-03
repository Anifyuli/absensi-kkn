// src/pages/AdminPage.tsx

import { useState, useEffect } from "preact/hooks";
import {
  getAbsensiByTanggal,
  getDailySummary,
  getAllAbsensi,
  getLocalDate,
} from "@/db/absensi";
import { getAllMahasiswa } from "@/db/mahasiswa";
import {
  verifyAdminPassword,
  getAdminList,
  addAdmin,
  removeAdmin,
  refreshAdminList,
} from "@/lib/auth";
import { StatusBadge } from "@/components/ShiftCard";
import { SHIFT_CONFIGS } from "@/lib/shifts";
import { useApp } from "@/store";

export function AdminPage() {
  const { addToast } = useApp();
  const [filterDate, setFilterDate] = useState(getLocalDate());
  const [activeSection, setActiveSection] = useState<
    "absensi" | "mahasiswa" | "pengaturan"
  >("absensi");

  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [allMahasiswa, setAllMahasiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount and when date changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAbsensiByTanggal(filterDate).then(setRecords).catch(console.error),
      getDailySummary(filterDate).then(setSummary).catch(console.error),
      getAllMahasiswa().then(setAllMahasiswa).catch(console.error),
    ]).finally(() => setLoading(false));
  }, [filterDate]);

  // Refresh admin list on mount
  useEffect(() => {
    refreshAdminList();
  }, []);

  async function exportCSV() {
    try {
      const data = await getAllAbsensi();
      if (!data.length) {
        addToast("Tidak ada data untuk diekspor.", "warning");
        return;
      }

      const header =
        "Tanggal,Nama,NIM,Prodi,Kelas,Shift,Jam Absen,Waktu Absen,Status";
      const rows = data.map((r) =>
        [
          r.tanggal,
          r.nama,
          r.nim,
          r.prodi,
          r.kelas,
          r.nama_shift,
          r.jam_absen,
          r.waktu_absen ?? "-",
          r.status,
        ]
          .map((v) => `"${v}"`)
          .join(","),
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `absensi_semua.csv`,
      });
      a.click();
      URL.revokeObjectURL(url);
      addToast("Data berhasil diekspor!", "success");
    } catch (err) {
      addToast("Gagal mengekspor data", "error");
    }
  }

  async function exportDayCSV() {
    if (!records.length) {
      addToast("Tidak ada data untuk tanggal ini.", "warning");
      return;
    }
    const header =
      "Tanggal,Nama,NIM,Prodi,Kelas,Shift,Jam Absen,Waktu Absen,Status";
    const rows = records.map((r) =>
      [
        r.tanggal,
        r.nama,
        r.nim,
        r.prodi,
        r.kelas,
        r.nama_shift,
        r.jam_absen,
        r.waktu_absen ?? "-",
        r.status,
      ]
        .map((v) => `"${v}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: `absensi_${filterDate}.csv`,
    }).click();
    URL.revokeObjectURL(url);
    addToast(`Ekspor ${filterDate} berhasil!`, "success");
  }

  return (
    <div class="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div class="flex items-center justify-between">
        <div>
          <div class="section-title">Panel Admin</div>
          <div class="font-mono text-xs text-slate-500 mt-0.5">
            Manajemen kehadiran seluruh mahasiswa
          </div>
        </div>
        <button onClick={exportCSV} class="btn-ghost text-xs gap-2">
          <span>⬇</span> Export Semua
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {loading || !summary ? (
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total Mahasiswa" value="-" color="amber" />
          <StatCard label="Hadir" value="-" color="emerald" />
          <StatCard label="Izin" value="-" color="sky" />
        </div>
      ) : (
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Mahasiswa"
            value={summary.total_mahasiswa}
            color="amber"
          />
          <StatCard label="Hadir" value={summary.hadir} color="emerald" />
          <StatCard label="Izin" value={summary.izin} color="sky" />
        </div>
      )}

      {/* ── Per Shift Stats ── */}
      {summary?.per_shift?.length > 0 && (
        <div class="grid grid-cols-3 gap-3">
          {SHIFT_CONFIGS.map((cfg) => {
            const data = summary.per_shift.find(
              (p: any) => p.shift_id === cfg.id,
            );
            return (
              <div key={cfg.id} class="card p-3 text-center">
                <div class="text-xl mb-1">{cfg.icon}</div>
                <div class="font-display font-bold text-2xl text-white">
                  {data?.count ?? 0}
                </div>
                <div class="label mt-0.5">{cfg.nama}</div>
                <div class="font-mono text-[10px] text-slate-600">
                  {cfg.jam}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sections ── */}
      <div class="flex gap-1 p-1 bg-ink-900 rounded-lg w-fit">
        {(["absensi", "mahasiswa", "pengaturan"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            class={`px-4 py-1.5 rounded-md text-sm font-body font-medium capitalize transition-all
                    ${activeSection === s ? "bg-amber-400 text-ink-950 font-bold" : "text-slate-400 hover:text-white"}`}
          >
            {s === "absensi"
              ? "📋 Absensi"
              : s === "mahasiswa"
                ? "👤 Mahasiswa"
                : "⚙️ Pengaturan"}
          </button>
        ))}
      </div>

      {loading ? (
        <div class="card p-12 text-center">
          <Spinner />
        </div>
      ) : (
        <>
          {activeSection === "absensi" && (
            <AbsensiSection
              records={records}
              filterDate={filterDate}
              onDateChange={setFilterDate}
              onExport={exportDayCSV}
            />
          )}
          {activeSection === "mahasiswa" && (
            <MahasiswaSection mahasiswa={allMahasiswa} />
          )}
          {activeSection === "pengaturan" && <PengaturanSection />}
        </>
      )}
    </div>
  );
}

// ── Absensi Section ──────────────────────────────────────────────────────────

function AbsensiSection({
  records,
  filterDate,
  onDateChange,
  onExport,
}: {
  records: any[];
  filterDate: string;
  onDateChange: (d: string) => void;
  onExport: () => void;
}) {
  return (
    <div class="space-y-3">
      <div class="flex items-center gap-3 flex-wrap">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => onDateChange((e.target as HTMLInputElement).value)}
          class="input-base max-w-[200px]"
        />
        <button onClick={onExport} class="btn-ghost text-xs">
          ⬇ CSV Hari Ini
        </button>
        <span class="font-mono text-xs text-slate-600 ml-auto">
          {records.length} catatan
        </span>
      </div>

      {records.length === 0 ? (
        <div class="card p-10 text-center">
          <div class="text-3xl mb-2 opacity-30">📋</div>
          <div class="font-mono text-xs text-slate-600 uppercase tracking-widest">
            Tidak ada data absensi untuk tanggal ini
          </div>
        </div>
      ) : (
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-ink-700 bg-ink-900/60">
                  {["Nama", "NIM", "Shift", "Waktu", "Status"].map((h) => (
                    <th
                      key={h}
                      class="px-4 py-3 text-left font-mono text-[10px] text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-700/40">
                {records.map((r) => (
                  <tr key={r.id} class="hover:bg-ink-700/20 transition-colors">
                    <td class="px-4 py-3 font-body text-white font-medium">
                      {r.nama}
                    </td>
                    <td class="px-4 py-3 font-mono text-xs text-slate-400">
                      {r.nim}
                    </td>
                    <td class="px-4 py-3">
                      <span class={`badge badge-shift-${r.shift_id}`}>
                        {r.nama_shift}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-xs text-slate-400">
                      {r.waktu_absen ?? "—"}
                    </td>
                    <td class="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mahasiswa Section ────────────────────────────────────────────────────────

function MahasiswaSection({ mahasiswa }: { mahasiswa: any[] }) {
  return (
    <div class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-ink-700 bg-ink-900/60 flex items-center justify-between">
        <span class="font-mono text-xs text-slate-500 uppercase tracking-wider">
          Daftar Mahasiswa
        </span>
        <span class="font-mono text-xs text-slate-600">
          {mahasiswa.length} terdaftar
        </span>
      </div>
      {mahasiswa.length === 0 ? (
        <div class="p-10 text-center font-mono text-xs text-slate-600">
          Belum ada mahasiswa terdaftar.
        </div>
      ) : (
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-ink-700">
                {["Nama", "NIM", "Prodi", "Kelas"].map((h) => (
                  <th
                    key={h}
                    class="px-4 py-3 text-left font-mono text-[10px] text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-700/40">
              {mahasiswa.map((m) => (
                <tr key={m.id} class="hover:bg-ink-700/20 transition-colors">
                  <td class="px-4 py-3 font-body text-white font-medium">
                    {m.nama}
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-400">
                    {m.nim}
                  </td>
                  <td class="px-4 py-3 font-body text-xs text-slate-400">
                    {m.prodi}
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-500">
                    {m.kelas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    sky: "text-sky-400",
  };
  return (
    <div class="card p-4">
      <div
        class={`font-display font-black text-3xl animate-count-up ${colorMap[color] ?? "text-white"}`}
      >
        {value}
      </div>
      <div class="label mt-1">{label}</div>
    </div>
  );
}

// ── Pengaturan Section ────────────────────────────────────────────────────────

function PengaturanSection() {
  const { addToast } = useApp();
  const [newAdminNim, setNewAdminNim] = useState("");

  return (
    <div class="card p-6 space-y-6">
      <div>
        <div class="section-title mb-2">Pengaturan Admin</div>
        <p class="font-body text-sm text-slate-400">
          Kelola pengaturan sistem dan keamanan akun administrator
        </p>
      </div>

      <div class="card">
        <div class="p-4 border-b border-ink-700/30">
          <div class="font-body font-medium text-white">Manajemen Admin</div>
          <p class="font-mono text-xs text-slate-500 mt-0.5">
            Kelola daftar administrator sistem
          </p>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <div class="font-body font-medium text-white mb-2">
              Daftar Admin Saat Ini
            </div>
            <div class="space-y-1">
              {getAdminList().map((nim) => (
                <div
                  key={nim}
                  class="flex items-center justify-between p-2 rounded-lg bg-ink-800"
                >
                  <span class="font-mono text-sm text-white">{nim}</span>
                  {getAdminList().length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus ${nim} dari daftar admin?`)) {
                          const success = removeAdmin(nim);
                          addToast(
                            success
                              ? `Admin ${nim} dihapus`
                              : "Gagal menghapus admin",
                            success ? "success" : "error",
                          );
                        }
                      }}
                      class="font-mono text-xs text-rose-400 hover:text-rose-300"
                    >
                      ❌ Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div class="font-body font-medium text-white mb-2">
              Tambah Admin Baru
            </div>
            <div class="flex gap-2">
              <input
                type="text"
                class="input-base flex-1"
                placeholder="Masukkan NIM mahasiswa"
                value={newAdminNim}
                onInput={(e) =>
                  setNewAdminNim((e.target as HTMLInputElement).value)
                }
              />
              <button
                onClick={() => {
                  if (!newAdminNim.trim()) {
                    addToast("Masukkan NIM terlebih dahulu", "warning");
                    return;
                  }
                  const success = addAdmin(newAdminNim.trim());
                  if (success) {
                    addToast(`Admin ${newAdminNim} ditambahkan`, "success");
                    setNewAdminNim("");
                  } else {
                    addToast("Gagal menambah admin", "error");
                  }
                }}
                class="btn-primary px-4 py-2"
              >
                ✚ Tambah
              </button>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <div class="font-body font-medium text-amber-400 mb-1">
              ⚠️ Perhatian
            </div>
            <p class="font-mono text-xs text-slate-400">
              Setidaknya 1 admin harus selalu tersisa. Anda tidak dapat
              menghapus admin terakhir.
            </p>
          </div>
        </div>
      </div>

      <div class="card p-4 space-y-3">
        <div>
          <div class="font-body font-medium text-white">Informasi Sistem</div>
          <p class="font-mono text-xs text-slate-500">
            Versi dan konfigurasi dasar
          </p>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-mono text-xs text-slate-500 uppercase">
              Versi Aplikasi
            </span>
            <span class="font-body text-sm text-white">2.0.0 (API)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-mono text-xs text-slate-500 uppercase">
              Database
            </span>
            <span class="font-body text-sm text-white">SQLite (Server)</span>
          </div>
        </div>
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
