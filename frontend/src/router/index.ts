import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../store/auth.store";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { guestOnly: true }, // اضافه شدن متا تگ
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { guestOnly: true }, // اضافه شدن متا تگ
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/play/:categoryId",
      name: "solo-play",
      component: () => import("../views/SoloGameView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/duel-lobby/:categoryId",
      name: "duel-lobby",
      component: () => import("../views/DuelLobbyView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/duel/:sessionId",
      name: "duel-play",
      component: () => import("../views/DuelGameView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/leaderboard",
      name: "leaderboard",
      component: () => import("../views/LeaderboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      component: () => import("../views/admin/AdminLayout.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: "", redirect: "/admin/dashboard" },
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("../views/admin/AdminDashboardView.vue"),
        },
        {
          path: "categories",
          name: "admin-categories",
          component: () => import("../views/admin/AdminCategoriesView.vue"),
        },
        {
          path: "reports",
          name: "admin-reports",
          component: () => import("../views/admin/AdminReportsView.vue"),
        },
        {
          path: "questions",
          name: "admin-questions",
          component: () => import("../views/admin/AdminQuestionsView.vue"),
        },
        {
          path: "questions/new",
          name: "admin-question-new",
          component: () => import("../views/admin/AdminQuestionFormView.vue"),
        },
        {
          path: "questions/:id/edit",
          name: "admin-question-edit",
          component: () => import("../views/admin/AdminQuestionFormView.vue"),
        },
        {
          path: "questions/bulk-import",
          name: "admin-question-bulk-import",
          component: () => import("../views/admin/AdminBulkImportView.vue"),
        },
        {
          path: "users",
          name: "admin-users",
          component: () => import("../views/admin/AdminUsersView.vue"),
        },
        {
          path: "promo-codes",
          name: "admin-promo-codes",
          component: () => import("../views/admin/AdminPromoCodesView.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  // ۱. جلوگیری از دسترسی کاربران لاگین‌نشده به صفحات محافظت‌شده
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  // ۲. جلوگیری از دسترسی کاربران عادی به پنل ادمین
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: "home" };
  }

  // ۳. جلوگیری از دسترسی کاربران لاگین‌شده به صفحات لاگین/ثبت‌نام
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: "home" };
  }
});