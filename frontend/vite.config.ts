import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// base must match the GitHub repository name for GitHub Pages routing
export default defineConfig({
  base: "/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "چیستا",
        short_name: "Chista",
        description: "بازی چیستا آنلاین تک‌نفره و دونفره",
        theme_color: "#611f69",
        background_color: "#fefbff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icons/icon-48.png", sizes: "48x48", type: "image/png" },
          { src: "icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-144.png", sizes: "144x144", type: "image/png" },
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      },
    }),
  ],
});
