import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../store/auth.store";

// Hash history is required for GitHub Pages (no server-side rewrite
// rules available for path-based SPA routing on static hosting).
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "login", component: () => import("../views/LoginView.vue") },
    { path: "/register", name: "register", component: () => import("../views/RegisterView.vue") },
    { path: "/home", name: "home", component: () => import("../views/HomeView.vue"), meta: { requiresAuth: true } },
    { path: "/play/:categoryId", name: "solo-play", component: () => import("../views/SoloGameView.vue"), meta: { requiresAuth: true } },
    { path: "/duel/:sessionId", name: "duel-play", component: () => import("../views/DuelGameView.vue"), meta: { requiresAuth: true } },
    { path: "/leaderboard", name: "leaderboard", component: () => import("../views/LeaderboardView.vue"), meta: { requiresAuth: true } },
    { path: "/settings", name: "settings", component: () => import("../views/SettingsView.vue"), meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }
});
