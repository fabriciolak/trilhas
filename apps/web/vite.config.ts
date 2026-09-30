import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// O WebContainer precisa de isolamento entre origens (SharedArrayBuffer): os mesmos
// cabeçalhos vão para o deploy (netlify.toml, vercel.json, public/_headers).
const isolamento = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { headers: isolamento },
  preview: { headers: isolamento },
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
});
