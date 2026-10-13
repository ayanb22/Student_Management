import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api to Django so you don't need CORS during development.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://127.0.0.1:8000" } },
});
