// Script untuk backup data dari localStorage browser
// Jalankan di console Firefox: F12 → Console → paste script ini

(function exportDatabase() {
  const DB_KEY = "absensi_preact_db_v1";
  const data = localStorage.getItem(DB_KEY);

  if (!data) {
    console.error("❌ Database tidak ditemukan di localStorage");
    return null;
  }

  console.log("✓ Database ditemukan, ukuran:", data.length, "bytes");

  // Download sebagai file JSON
  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    database: data
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `absensi-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("✓ Backup berhasil diunduh!");
  return backup;
})();
