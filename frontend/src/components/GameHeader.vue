<template>
  <header class="flex items-center justify-between px-4 py-3 rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
    <button
      class="flex items-center gap-2 rounded-pill px-3 py-1.5 border border-border-light dark:border-border-dark text-sm font-bold hover:bg-accent-light/10 transition-colors"
      @click="$emit('leave')"
    >
      <span class="text-base">→</span>
      <span>خروج</span>
    </button>

    <div class="flex items-center gap-3 text-sm">
      <span class="flex items-center gap-1">
        <span>✅</span>
        <span class="font-bold text-green-500">{{ correctCount }}</span>
      </span>
      <span class="flex items-center gap-1">
        <span>❌</span>
        <span class="font-bold text-red-500">{{ wrongCount }}</span>
      </span>
      <span class="flex items-center gap-1">
        <span>⏱</span>
        <span class="font-bold">{{ elapsedLabel }}</span>
      </span>
      <span class="flex items-center gap-1">
        <span>⭐</span>
        <span class="font-bold text-accent-light dark:text-accent-dark">{{ score }}</span>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  correctCount: number;
  wrongCount: number;
  elapsedSeconds: number;
  score: number;
}>();

defineEmits<{ leave: [] }>();

const elapsedLabel = computed(() => {
  const m = String(Math.floor(props.elapsedSeconds / 60)).padStart(2, "0");
  const s = String(props.elapsedSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
});
</script>
