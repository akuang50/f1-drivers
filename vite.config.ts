import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/f1-drivers/",
  plugins: [react(), tailwindcss()],
});
