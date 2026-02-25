/// <reference types="vite/client" />

// Declare sql.js global from CDN script
interface Window {
  initSqlJs: (config: { locateFile: (file: string) => string }) => Promise<unknown>
}
