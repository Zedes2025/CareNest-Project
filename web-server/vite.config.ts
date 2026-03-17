import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000, // in kB , this is added for build error-chunk size limit warning (This doesn’t reduce bundle size, just suppresses the warning).
  },
});
