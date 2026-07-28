<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto flex flex-col gap-6">
    <div class="flex items-center">
      <a href="#" class="text-2xl" @click.prevent="cancelAndLeave">←</a>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <template v-if="!errorMessage">
        <div class="w-16 h-16 border-4 border-accent-light dark:border-accent-dark border-t-transparent rounded-full animate-spin"></div>
        <p class="text-lg font-bold">در انتظار حریف...</p>
        <p class="text-sm text-gray-500">{{ elapsedLabel }}</p>
      </template>

      <template v-else>
        <p class="text-lg font-bold text-red-500">{{ errorMessage }}</p>
        <button
          class="rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold"
          @click="retry"
        >
          تلاش دوباره
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '../services/api-client'

const route = useRoute()
const router = useRouter()
const categoryId = route.params.categoryId as string

const errorMessage = ref('')
const elapsedSeconds = ref(0)
const elapsedLabel = ref('00:00')

let pollInterval: ReturnType<typeof setInterval> | null = null
let tickInterval: ReturnType<typeof setInterval> | null = null

// حداکثر زمان انتظار قبل از نمایش خطا (باید هم‌راستا با MATCHMAKING_TTL در بک‌اند باشد)
const MAX_WAIT_SECONDS = 60

async function startMatchmaking() {
  errorMessage.value = ''
  elapsedSeconds.value = 0

  try {
    // نکته مهم: apiClient پاسخ را مستقیم برمی‌گرداند (بدون بسته‌بندی در data)
    const enqueueResult = await apiClient.post<{ matched: boolean; sessionId?: string }>(
      '/api/game/duel/matchmake',
      { categoryId }
    )

    if (enqueueResult.data.matched && enqueueResult.data.sessionId) {
      goToMatch(enqueueResult.data.sessionId)
      return
    }

    tickInterval = setInterval(() => {
      elapsedSeconds.value += 1
      const m = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
      const s = String(elapsedSeconds.value % 60).padStart(2, '0')
      elapsedLabel.value = `${m}:${s}`

      if (elapsedSeconds.value >= MAX_WAIT_SECONDS) {
        stopPolling()
        errorMessage.value = 'حریفی پیدا نشد. لطفا دوباره تلاش کنید.'
      }
    }, 1000)

    pollInterval = setInterval(async () => {
      try {
        const pollResult = await apiClient.get<{ matched: boolean; sessionId?: string }>(
          '/api/game/duel/matchmake/poll'
        )
        if (pollResult.data.matched && pollResult.data.sessionId) {
          goToMatch(pollResult.data.sessionId)
        }
      } catch {
        // خطای موقت شبکه در poll را نادیده می‌گیریم، دور بعدی دوباره تلاش می‌شود
      }
    }, 2000)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'خطا در اتصال به سرور.'
  }
}

function goToMatch(sessionId: string) {
  stopPolling()
  router.push(`/duel/${sessionId}`)
}

function stopPolling() {
  if (pollInterval) clearInterval(pollInterval)
  if (tickInterval) clearInterval(tickInterval)
  pollInterval = null
  tickInterval = null
}

function retry() {
  startMatchmaking()
}

async function cancelAndLeave() {
  stopPolling()
  try {
    await apiClient.post('/api/game/duel/matchmake/cancel', { categoryId })
  } catch {
    // اگر لغو در سرور خطا داد هم کاربر را معطل نمی‌کنیم
  }
  router.push('/home')
}

onMounted(startMatchmaking)
onUnmounted(stopPolling)
</script>