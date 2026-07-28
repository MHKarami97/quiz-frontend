<template>
  <div class="min-h-screen pb-24 p-6 max-w-lg mx-auto">
    <header class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <span class="text-xl">🪙</span>
        <span class="font-bold">{{ authStore.user?.coins ?? 0 }}</span>
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

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        v-for="category in categories"
        :key="category.id"
        class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 text-center cursor-pointer"
        @click="startGame(category.id)"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import AdSlot from '../components/AdSlot.vue'
import BottomNav from '../components/BottomNav.vue'
import { apiClient } from '../services/api-client'

const router = useRouter()
const authStore = useAuthStore()
const mode = ref<'solo' | 'duel'>('solo')

interface Category {
  id: string
  name: string
  icon: string
}

const categories = ref<Category[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const { data } = await apiClient.get<Category[]>("/api/categories");
    categories.value = data;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'خطا در دریافت دسته‌بندی‌ها'
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
