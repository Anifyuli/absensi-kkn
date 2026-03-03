// src/pages/LoginPage.tsx

import { useState } from "preact/hooks";
import {
  login as loginApi,
  register as registerApi,
  checkAdmin,
} from "@/lib/api";
import { getSession, setSession, verifyAdminPassword } from "@/lib/auth";
import { useApp } from "@/store";

type Tab = "masuk" | "daftar";

export function LoginPage() {
  const [tab, setTab] = useState<Tab>("masuk");

  return (
    <div class="min-h-screen bg-ink-950 grid-scan noise flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div
        class="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                  bg-amber-400/5 blur-[100px] rounded-full pointer-events-none"
      />

      <div class="relative w-full max-w-md animate-fade-up">
        {/* Header */}
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                      bg-amber-400/10 border border-amber-400/20 mb-4"
          >
            <span class="text-2xl">⬡</span>
          </div>
          <h1 class="font-display font-black text-4xl tracking-widest text-white uppercase">
            Absensi
          </h1>
          <p class="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500 mt-1">
            Sistem Pencatatan Kehadiran
          </p>
        </div>

        {/* Card */}
        <div class="card p-6">
          {/* Tabs */}
          <div class="flex gap-1 p-1 bg-ink-900 rounded-lg mb-6">
            {(["masuk", "daftar"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                class={`flex-1 py-2 px-3 rounded-md text-sm font-body font-medium capitalize
                        transition-all duration-150
                        ${
                          tab === t
                            ? "bg-amber-400 text-ink-950 font-bold shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
              >
                {t === "masuk" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {tab === "masuk" && <LoginForm />}
          {tab === "daftar" && (
            <RegisterForm onSuccess={() => setTab("masuk")} />
          )}
        </div>

        <p class="text-center font-mono text-[10px] text-slate-700 mt-6 uppercase tracking-widest">
          KKN Desa Pasucen 2025/2026 <br /> Sekolah Tinggi Teknik Pati
        </p>
      </div>
    </div>
  );
}

// ── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const { login, addToast } = useApp();
  const [nim, setNim] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    if (!nim.trim()) {
      setError("NIM tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const m = await loginApi(nim.trim());
      login(m);
      addToast(`Selamat datang, ${m.nama}! 👋`, "success");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <FormGroup label="NIM / ID Mahasiswa">
        <input
          class="input-base"
          type="text"
          placeholder="Masukkan NIM Anda"
          value={nim}
          onInput={(e) => {
            setNim((e.target as HTMLInputElement).value);
            setError("");
          }}
          autoComplete="off"
        />
      </FormGroup>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <button type="submit" disabled={loading} class="btn-primary w-full mt-2">
        {loading ? <Spinner /> : "→ Masuk"}
      </button>
    </form>
  );
}

// ── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, addToast } = useApp();
  const [form, setForm] = useState({
    nim: "",
    nama: "",
    prodi: "Informatika",
    kelas: "Reguler",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setError("");
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!form.nim.trim() || !form.nama.trim()) {
      setError("NIM dan Nama wajib diisi");
      return;
    }
    if (form.nim.trim().length < 3) {
      setError("NIM minimal 3 karakter");
      return;
    }

    setLoading(true);
    try {
      const m = await registerApi(
        form.nim.trim(),
        form.nama.trim(),
        form.prodi,
        form.kelas,
      );
      login(m);
      addToast(
        `Akun berhasil dibuat! Selamat datang, ${m.nama}! 🎉`,
        "success",
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-3">
      <FormGroup label="NIM">
        <input
          class="input-base"
          type="text"
          placeholder="NIM unik Anda"
          value={form.nim}
          onInput={(e) => set("nim", (e.target as HTMLInputElement).value)}
        />
      </FormGroup>
      <FormGroup label="Nama Lengkap">
        <input
          class="input-base"
          type="text"
          placeholder="Nama lengkap"
          value={form.nama}
          onInput={(e) => set("nama", (e.target as HTMLInputElement).value)}
        />
      </FormGroup>
      <div class="grid grid-cols-2 gap-3">
        <FormGroup label="Program Studi">
          <select
            class="input-base"
            value={form.prodi}
            onChange={(e) =>
              set("prodi", (e.target as HTMLSelectElement).value)
            }
          >
            <option>Informatika</option>
            <option>Teknik Elektro</option>
          </select>
        </FormGroup>
        <FormGroup label="Kelas">
          <select
            class="input-base"
            value={form.kelas}
            onChange={(e) =>
              set("kelas", (e.target as HTMLSelectElement).value)
            }
          >
            <option>Reguler</option>
            <option>Karyawan</option>
          </select>
        </FormGroup>
      </div>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <button type="submit" disabled={loading} class="btn-primary w-full mt-1">
        {loading ? <Spinner /> : "→ Daftar & Masuk"}
      </button>
    </form>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function FormGroup({
  label,
  children,
}: {
  label: string;
  children: preact.ComponentChildren;
}) {
  return (
    <div class="space-y-1.5">
      <label class="label">{label}</label>
      {children}
    </div>
  );
}

function ErrorMsg({ children }: { children: preact.ComponentChildren }) {
  return (
    <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
      <span class="font-mono text-rose-400 text-sm">✕</span>
      <span class="font-body text-sm text-rose-300">{children}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
