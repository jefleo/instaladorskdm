/**
 * Build do vídeo: o filme é um site React que é função pura do tempo.
 * Raiz em video/, saída em video/dist/index.html (arquivo único, sem CDN),
 * capturado quadro a quadro pelo Playwright (video/scripts/render.mjs).
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const raiz = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: `${raiz}video`,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: "./",
  // O filme importa src/ do site (dados, formatos, componentes base).
  server: { fs: { allow: [raiz] } },
  build: {
    outDir: `${raiz}video/dist`,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 8000,
  },
});
