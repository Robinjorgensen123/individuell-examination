import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      threshold: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
      exclude: [
        "node_modules/",
        "src/mocks/",
        "vite.config.js",
        "src/main.jsx",
      ],
    },
  },
});
