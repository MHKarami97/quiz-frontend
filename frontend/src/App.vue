<template>
  <div>
    <!-- PWA Update Banner -->
    <div
      v-if="needsRefresh"
      class="fixed top-0 left-0 right-0 z-50 bg-accent-light dark:bg-accent-dark text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg"
    >
      <p class="text-sm font-bold">نسخه جدیدی از اپلیکیشن موجود است! 🚀</p>
      <div class="flex gap-2">
        <button
          class="rounded-pill px-4 py-1.5 bg-white text-accent-light dark:text-accent-dark text-sm font-bold"
          @click="updateApp"
        >
          به‌روزرسانی
        </button>
        <button class="text-white/70 text-sm" @click="needsRefresh = false">
          بعداً
        </button>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";

const needsRefresh = ref(false);
let updateSW: (() => Promise<void>) | null = null;

const { updateServiceWorker } = useRegisterSW({
  onNeedRefresh() {
    needsRefresh.value = true;
  },
  onOfflineReady() {
    // silent — app is ready for offline
  },
});

updateSW = updateServiceWorker;

async function updateApp() {
  needsRefresh.value = false;
  await updateSW?.();
}
</script>
