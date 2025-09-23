import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": "/src/components",
      "@layouts": "/src/layouts",
      "@pages": "/src/pages",
      "@contexts": "/src/contexts",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React ecosystem
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor";
            }
            if (
              id.includes("lucide-react") ||
              id.includes("@radix-ui/react-navigation-menu") ||
              id.includes("@radix-ui/react-calendar") ||
              id.includes("react-day-picker")
            ) {
              return "ui";
            }
            if (
              id.includes("class-variance-authority") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "utils";
            }
            if (id.includes("date-fns")) {
              return "date";
            }
          }
          // Components chunks
          if (id.includes("/src/components/")) {
            return "components";
          }
        },
      },
    },
    // Tăng chunk size limit để tắt warning
    chunkSizeWarningLimit: 1000,
  },
});
