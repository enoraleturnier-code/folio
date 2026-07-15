import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  server: { port: 8080 },
  // Vercel injecte VERCEL_ENV ("production"/"preview"/"development") côté
  // build, jamais côté client (Vite n'expose que les vars préfixées VITE_).
  // On le relaie explicitement pour gater le PersonaSwitcher aux previews
  // uniquement, jamais au vrai domaine de prod (cf. RootLayout.tsx).
  define: {
    "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV ?? ""),
  },
});
