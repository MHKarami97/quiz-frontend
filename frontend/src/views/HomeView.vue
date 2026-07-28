<template>
  <div class="min-h-screen pb-24 p-6 max-w-lg mx-auto">
    <header class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <span class="text-xl">🪙</span>
        <span class="font-bold">{{ authStore.user?.coins ?? 0 }}</span>
      </div>
      <router-link to="/settings" class="text-2xl">⚙️</router-link>
    </header>

    <h1 class="text-2xl font-bold mb-4">سلام {{ authStore.user?.displayName }}</h1>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        v-for="category in categories"
        :key="category.id"
        class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 text-center cursor-pointer"
        @click="startSolo(category.id)"
      >
        <div class="text-3xl mb-2">{{ category.icon }}</div>
        <div class="font-semibold">{{ category.name }}</div>
      </div>
    </div>

    <AdSlot slot-id="home-banner" :height-px="90" class="mb-6" />

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.store";
import AdSlot from "../components/AdSlot.vue";
import BottomNav from "../components/BottomNav.vue";

const router = useRouter();
const authStore = useAuthStore();

// Static fallback list — replace with GET /api/categories once
// a categories endpoint is added.
const categories = ref([
  { id: "general", name: "عمومی", icon: "🧠" },
  { id: "sport", name: "ورزش", icon: "⚽" },
  { id: "science", name: "علمی", icon: "🔬" },
  { id: "history", name: "تاریخ", icon: "📜" },
]);

function startSolo(categoryId: string) {
  router.push(`/play/${categoryId}`);
}
</script>
