<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">داشبورد</h2>

    <div v-if="isLoading" class="text-center text-gray-500">در حال بارگذاری آمار...</div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="card in cards" :key="card.label" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5">
        <div class="text-3xl mb-2">{{ card.icon }}</div>
        <div class="text-2xl font-bold">{{ card.value }}</div>
        <div class="text-sm text-gray-500">{{ card.label }}</div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <router-link to="/admin/questions/new" class="rounded-card bg-accent-light dark:bg-accent-dark text-white p-5 text-center font-bold">
        ➕ افزودن سؤال جدید
      </router-link>
      <router-link to="/admin/categories" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 text-center font-bold">
        🗂️ مدیریت دسته‌بندی‌ها
      </router-link>
      <router-link to="/admin/promo-codes" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 text-center font-bold">
        🎁 ساخت کد تخفیف
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { adminApi, DashboardStats } from "../../services/admin-api";

const stats = ref<DashboardStats | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const { data } = await adminApi.getDashboardStats();
    stats.value = data;
  } finally {
    isLoading.value = false;
  }
});

const cards = computed(() => [
  { label: "کاربران", value: stats.value?.totalUsers ?? 0, icon: "👥" },
  { label: "سؤالات", value: stats.value?.totalQuestions ?? 0, icon: "❓" },
  { label: "دسته‌بندی‌ها", value: stats.value?.totalCategories ?? 0, icon: "🗂️" },
  { label: "بازی‌های انجام‌شده", value: stats.value?.totalGameSessions ?? 0, icon: "🎮" },
]);
</script>