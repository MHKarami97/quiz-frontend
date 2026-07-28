/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: { light: "#fefbff", dark: "#1a0f1f" },
        card: { light: "#ffffff", dark: "#2d0f33" },
        accent: { light: "#611f69", dark: "#a855f7" },
        border: { light: "#eac8fe", dark: "#73039433" },
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
