import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/directory-tree/",
  plugins: [react()],
  server: {
    open: true,
  },
});
