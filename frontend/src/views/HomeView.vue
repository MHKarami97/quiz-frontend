<template>
  <div class="min-h-screen pb-24 p-6 max-w-lg mx-auto">
    <header class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xl">🪙</span>
          <span class="font-bold">{{ authStore.user?.coins ?? 0 }}</span>
        </div>
        <div v-if="gameStore.myScore" class="flex items-center gap-2">
          <span class="text-xl">🏆</span>
          <span class="font-bold">{{ gameStore.myScore.totalPoints }}</span>
          <span v-if="gameStore.myScore.rank" class="text-xs text-gray-500">(رتبه {{ gameStore.myScore.rank }})</span>
        </div>
      </div>
      <router-link to="/settings" class="text-2xl">⚙️</router-link>
    </header>

    <h1 class="text-2xl font-bold mb-4">{{ authStore.user?.displayName }}</h1>

    <div class="flex gap-2 mb-6">
      <button
        class="flex-1 rounded-pill py-2 font-bold border"
        :class="mode === 'solo' ? 'bg-accent-light dark:bg-accent-dark text-white border-transparent' : 'border-border-light dark:border-border-dark'"
        @click="mode = 'solo'"
      >
        تکی
      </button>
      <button
        class="flex-1 rounded-pill py-2 font-bold border"
        :class="mode === 'duel' ? 'bg-accent-light dark:bg-accent-dark text-white border-transparent' : 'border-border-light dark:border-border-dark'"
        @click="mode = 'duel'"
      >
        دو نفره
      </button>
    </div>

    <p v-if="errorMessage" class="text-red-500 text-sm mb-4 text-center">{{ errorMessage }}</p>

    <div v-if="isLoading" class="text-center text-gray-500 py-8">در حال بارگذاری دسته‌بندی‌ها...</div>

    <div v-else class="grid grid-cols-2 gap-4 mb-6">
      <div
        v-for="category in gameStore.categories"
        :key="category.id"
        class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 text-center cursor-pointer"
        @click="startGame(category.id)"
      >
        <div class="text-3xl mb-2">{{ category.icon }}</div>
        <div class="font-semibold">{{ category.name }}</div>
      </div>
      <p v-if="gameStore.categories.length === 0" class="col-span-2 text-center text-gray-500 py-8">
        دسته‌بندی‌ای یافت نشد.
      </p>
    </div>

    <AdSlot slot-id="home-banner" :height-px="90" class="mb-6" />
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import { useGameStore } from '../store/game.store'
import AdSlot from '../components/AdSlot.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const mode = ref<'solo' | 'duel'>('solo')

const isLoading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      gameStore.fetchCategories(),
      gameStore.fetchScore()
    ])
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'خطا در دریافت اطلاعات'
  } finally {
    isLoading.value = false
  }
})

function startGame(categoryId: string) {
  if (mode.value === 'solo') {
    router.push(`/play/${categoryId}`)
  } else {
    router.push(`/duel-lobby/${categoryId}`)
  }
}
</script>