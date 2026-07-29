<template>
  <button
    class="w-full py-4 px-6 rounded-pill font-bold text-base transition-all duration-200 border-2"
    :class="stateClasses"
    :disabled="disabled"
    @click="$emit('select')"
  >
    {{ text }}
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  text: string;
  state: "idle" | "selected" | "correct" | "wrong";
  disabled?: boolean;
}>();
defineEmits<{ select: [] }>();

const stateClasses = computed(() => ({
  "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark text-accent-light dark:text-accent-dark":
    props.state === "idle",
  "bg-accent-light/10 border-accent-light dark:border-accent-dark": props.state === "selected",
  "bg-green-500 border-green-600 text-white": props.state === "correct",
  "bg-red-500 border-red-600 text-white": props.state === "wrong",
}));
</script>