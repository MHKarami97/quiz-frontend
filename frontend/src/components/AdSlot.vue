<template>
  <!-- Reserved ad placeholder. Replace the inner content with your
       actual ad banner image/iframe once a network is configured. -->
  <div
    class="w-full rounded-card border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm"
    :style="{ height: heightPx + 'px' }"
  >
    فضای تبلیغات ({{ slotId }})
  </div>
</template>

<script setup lang="ts">
defineProps<{ slotId: string; heightPx?: number }>();
withDefaults(defineProps<{ slotId: string; heightPx?: number }>(), { heightPx: 90 });
</script>
