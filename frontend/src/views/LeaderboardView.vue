<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto pb-24">
    <h1 class="text-2xl font-bold mb-4">جدول امتیازات</h1>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-4">
      <div class="w-12 h-12 border-4 border-accent-light dark:border-accent-dark border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-500">در حال بارگذاری...</p>
    </div>

    <p v-else-if="errorMessage" class="text-red-500 text-center py-8">{{ errorMessage }}</p>

    <div v-else class="space-y-2">
      <div
        v-for="(entry, index) in leaderboard"
        :key="entry.display_name"
        class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 flex justify-between items-center"
      >
        <span class="font-bold">{{ index + 1 }}. {{ entry.display_name }}</span>
        <span>{{ entry.total_points }} امتیاز</span>
      </div>
      <p v-if="leaderboard.length === 0" class="text-gray-500 text-center py-8">هنوز داده‌ای وجود ندارد.</p>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiClient } from "../services/api-client";
import BottomNav from "../components/BottomNav.vue";

const leaderboard = ref<{ display_name: string; total_points: number }[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  try {
    const { data } = await apiClient.get("/api/leaderboard/global");
    leaderboard.value = data;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در دریافت جدول امتیازات";
  } finally {
    isLoading.value = false;
  }
});
</script>
