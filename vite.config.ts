import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function spaFallback(): Plugin {
  return {
    name: "spa-github-pages-fallback",
    closeBundle() {
      const index = path.resolve("dist/index.html");
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.resolve("dist/404.html"));
      }
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/f1-drivers/" : "/",
  plugins: [react(), tailwindcss(), spaFallback()],
});
