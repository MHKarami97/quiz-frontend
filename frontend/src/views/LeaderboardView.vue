<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto pb-24">
    <h1 class="text-2xl font-bold mb-4">جدول امتیازات</h1>
    <div class="space-y-2">
      <div
        v-for="(entry, index) in leaderboard"
        :key="entry.display_name"
        class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 flex justify-between items-center"
      >
        <span class="font-bold">{{ index + 1 }}. {{ entry.display_name }}</span>
        <span>{{ entry.total_points }} امتیاز</span>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiClient } from "../services/api-client";
import BottomNav from "../components/BottomNav.vue";

const leaderboard = ref<{ display_name: string; total_points: number }[]>([]);

onMounted(async () => {
  const { data } = await apiClient.get("/api/leaderboard/global");
  leaderboard.value = data;
});
</script>
