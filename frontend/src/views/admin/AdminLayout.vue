<template>
  <div class="min-h-screen flex flex-col md:flex-row">
    <aside class="w-full md:w-64 bg-card-light dark:bg-card-dark border-b md:border-b-0 md:border-l border-border-light dark:border-border-dark p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
      <h1 class="hidden md:block text-xl font-bold mb-4 px-2">پنل مدیریت چیستا</h1>

      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="whitespace-nowrap px-4 py-2 rounded-pill md:rounded-lg font-medium transition-colors"
        :class="isActive(item.to) ? 'bg-accent-light dark:bg-accent-dark text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
      >
        {{ item.icon }} {{ item.label }}
      </router-link>

      <div class="hidden md:block mt-auto pt-4 border-t border-border-light dark:border-border-dark">
        <router-link to="/home" class="block px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
          ⬅ بازگشت به اپ
        </router-link>
        <button @click="handleLogout" class="w-full text-right px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800">
          خروج از حساب
        </button>
      </div>
    </aside>

    <main class="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth.store";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = [
  { to: "/admin/dashboard", label: "داشبورد", icon: "📊" },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: "🗂️" },
  { to: "/admin/questions", label: "سؤالات", icon: "❓" },
  { to: "/admin/users", label: "کاربران", icon: "👥" },
  { to: "/admin/promo-codes", label: "کدهای تخفیف", icon: "🎁" },
];

function isActive(path: string) {
  return route.path.startsWith(path);
}

function handleLogout() {
  authStore.logout();
  router.push("/");
}
</script>