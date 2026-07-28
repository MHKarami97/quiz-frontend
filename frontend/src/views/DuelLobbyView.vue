<template>
  <div
    class="min-h-screen p-6 max-w-lg mx-auto flex flex-col justify-center gap-6 pb-24"
  >
    <h1 class="text-2xl font-bold text-center">بازی دونفره</h1>

    <div v-if="isLoading" class="text-center text-gray-500 py-8">
      در حال بارگذاری...
    </div>

    <div v-else-if="!isSearching" class="grid grid-cols-2 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 text-center cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
        @click="startMatchmaking(category.id)"
      >
        <div class="text-3xl mb-2">{{ category.icon }}</div>
        <div class="font-semibold">{{ category.name }}</div>
      </div>
    </div>

    <div v-else class="text-center">
      <div class="animate-pulse text-xl font-bold mb-2">
        در حال جستجوی حریف...
      </div>
      <p v-if="errorMessage" class="text-red-500 text-sm mb-2">
        {{ errorMessage }}
      </p>
      <button
        class="mt-4 rounded-pill px-6 py-2 border border-border-light dark:border-border-dark font-bold"
        @click="cancelSearch"
      >
        لغو
      </button>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { apiClient } from "../services/api-client";
import BottomNav from "../components/BottomNav.vue";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MatchmakeResponse {
  matched: boolean;
  sessionId?: string;
}

const router = useRouter();
const categories = ref<Category[]>([]);
const isLoading = ref(true);
const isSearching = ref(false);
const errorMessage = ref("");
let pollInterval: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  try {
    const { data } = await apiClient.get<Category[]>("/api/categories");
    categories.value = data;
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "خطا در دریافت دسته‌بندی‌ها";
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

async function startMatchmaking(categoryId: string) {
  isSearching.value = true;
  errorMessage.value = "";

  try {
    const result = await apiClient.post<MatchmakeResponse>(
      "/api/game/duel/matchmake",
      {
        categoryId,
      },
    );

    if (result.data.matched && result.data.sessionId) {
      router.push(`/duel/${result.data.sessionId}`);
      return;
    }

    pollInterval = setInterval(async () => {
      try {
        const poll = await apiClient.get<MatchmakeResponse>(
          "/api/game/duel/matchmake/poll",
        );
        if (poll.data.matched && poll.data.sessionId) {
          if (pollInterval) clearInterval(pollInterval);
          router.push(`/duel/${poll.data.sessionId}`);
        }
      } catch (err) {
        if (pollInterval) clearInterval(pollInterval);
        errorMessage.value =
          err instanceof Error ? err.message : "خطا در جستجوی حریف";
        isSearching.value = false;
      }
    }, 2000);
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "خطا در شروع جستجو";
    isSearching.value = false;
  }
}

function cancelSearch() {
  if (pollInterval) clearInterval(pollInterval);
  isSearching.value = false;
}
</script>
