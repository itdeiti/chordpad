import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    base: "/chordpad/",
    plugins: [react()],
    server: {
      port: 3000,
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
