import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./main.css";
import { useThemeStore } from "./store/theme.store";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// Apply persisted theme before mount to avoid flash-of-wrong-theme
const themeStore = useThemeStore();
themeStore.applyPersistedTheme();

app.mount("#app");
