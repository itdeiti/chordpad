import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  return {
    // Served at root in dev (so the network URL works without a path on mobile);
    // built under /chordpad/ for the GitHub Pages deploy.
    base: command === "serve" ? "/" : "/chordpad/",
    plugins: [react()],
    server: {
      port: 3000,
      // Allow tunnel hostnames (localtunnel / cloudflared) to reach the dev
      // server; Vite blocks unknown Host headers by default.
      allowedHosts: true,
    },
    // Same allowance for `vite preview` (production-build smoke test on mobile).
    preview: {
      allowedHosts: true,
    },
    resolve: {
      alias: {
        app: resolve(__dirname, "src", "app"),
        components: resolve(__dirname, "src", "components"),
        domain: resolve(__dirname, "src", "domain"),
        state: resolve(__dirname, "src", "state"),
        features: resolve(__dirname, "src", "features"),
      },
    },
  };
});
