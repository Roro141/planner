import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two pages: the website, and the desktop widget (loaded by src-tauri).
      input: {
        main: "index.html",
        widget: "widget.html",
      },
    },
  },
  // Tauri runs the dev server on a fixed port (src-tauri/tauri.conf.json),
  // and Vite shouldn't watch the Rust build folder.
  server: {
    port: 5173,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  // Keep Tauri's messages visible in the terminal.
  clearScreen: false,
});
