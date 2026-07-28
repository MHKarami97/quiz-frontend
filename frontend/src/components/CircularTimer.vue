<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" class="mx-auto">
    <circle cx="50" cy="50" r="45" stroke-width="6" fill="none" class="stroke-gray-300 dark:stroke-gray-700" />
    <circle
      cx="50" cy="50" r="45" stroke-width="6" fill="none"
      class="stroke-accent-light dark:stroke-accent-dark transition-all duration-300"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      transform="rotate(-90 50 50)"
    />
    <text x="50" y="55" text-anchor="middle" class="fill-current text-xl font-bold">{{ secondsLeft }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ secondsLeft: number; totalSeconds: number; size?: number }>();
const circumference = 2 * Math.PI * 45;
const dashOffset = computed(() => circumference * (1 - props.secondsLeft / props.totalSeconds));
</script>
