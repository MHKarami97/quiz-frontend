import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark" | "system";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    mode: "system" as ThemeMode,
  }),
  actions: {
    applyPersistedTheme() {
      const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
      this.mode = saved ?? "system";
      this.applyToDocument();
    },
    setMode(mode: ThemeMode) {
      this.mode = mode;
      localStorage.setItem("theme-mode", mode);
      this.applyToDocument();
    },
    applyToDocument() {
      const isDark =
        this.mode === "dark" ||
        (this.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    },
  },
});