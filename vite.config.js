import { defineConfig } from "vite";

export default defineConfig({
  // Keep the production app portable when served beneath a preview subpath.
  base: "./",
});
