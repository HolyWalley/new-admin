import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "app/assets/builds/new_admin_custom",
    emptyOutDir: true,
    lib: {
      entry: "app/javascript/new_admin/index.ts",
      formats: ["iife"],
      name: "NewAdminCustom",
      fileName: () => "custom.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "window.React",
          "react-dom": "window.ReactDOM",
          "react/jsx-runtime": "window.__jsxRuntime__",
        },
      },
    },
  },
})
