import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// base must match the GitHub repository name for GitHub Pages routing
export default defineConfig({
  base: "/quiz-of-kings/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png"],
      manifest: {
        name: "کوییز پادشاهان",
        short_name: "QuizKings",
        description: "بازی کوییز آنلاین تک‌نفره و دونفره",
        theme_color: "#611f69",
        background_color: "#fefbff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/quiz-of-kings/",
        icons: [
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
