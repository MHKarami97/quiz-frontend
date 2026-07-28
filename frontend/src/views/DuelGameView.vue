<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto flex flex-col gap-6">
    <div class="flex items-center">
      <a href="#" class="text-2xl" @click.prevent="confirmLeave">←</a>
    </div>

    <p v-if="status === 'connecting'" class="text-center text-lg flex-1 flex items-center justify-center">
      در حال اتصال...
    </p>

    <p v-else-if="status === 'waiting'" class="text-center text-lg flex-1 flex items-center justify-center">
      در انتظار بازیکن دوم...
    </p>

    <div v-else-if="connectionError" class="flex-1 flex flex-col items-center justify-center text-center gap-3">
      <p class="text-lg font-bold text-red-500">{{ connectionError }}</p>
      <router-link to="/home" class="rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold">
        بازگشت به خانه
      </router-link>
    </div>

    <div v-else class="flex-1 flex flex-col justify-center gap-6">
      <QuestionCard
        v-if="currentQuestion && status === 'in_progress'"
        :question="currentQuestion"
        :selected-option-id="selectedOptionId"
        :correct-option-id="null"
        :has-answered="hasAnswered"
        @answer="handleAnswer"
      />
    </div>

    <div v-if="status === 'finished'" class="text-center">
      <h2 class="text-2xl font-bold mb-3">بازی دونفره تمام شد!</h2>
      <router-link to="/home" class="text-accent-light dark:text-accent-dark">بازگشت به خانه</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '../services/api-client'
import QuestionCard from '../components/QuestionCard.vue'

interface QuestionOption {
  id: string
  text: string
}
interface QuestionData {
  id: string
  text: string
  options: QuestionOption[]
}

const route = useRoute()
const router = useRouter()
const status = ref<'connecting' | 'waiting' | 'in_progress' | 'finished'>('connecting')
const currentQuestion = ref<QuestionData | null>(null)
const selectedOptionId = ref<string | null>(null)
const hasAnswered = ref(false)
const connectionError = ref('')
let socket: WebSocket | null = null

onMounted(async () => {
  const sessionId = route.params.sessionId as string

  if (!sessionId || sessionId === 'undefined') {
    connectionError.value = 'شناسه بازی نامعتبر است.'
    return
  }

  try {
    // نکته مهم: apiClient پاسخ را مستقیم برمی‌گرداند (بدون بسته‌بندی در data)
    const ticketRes = await apiClient.post<{ ticket: string }>(
      `/api/game/duel/${sessionId}/ws-ticket`
    )
    const ticket = ticketRes.data.ticket

    const wsBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('https', 'wss')
    socket = new WebSocket(
      `${wsBaseUrl}/api/game/duel/${sessionId}/join?ticket=${ticket}`
    )

    status.value = 'waiting'

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'match_started') status.value = 'in_progress'
      if (message.type === 'next_question') hasAnswered.value = false
      if (message.type === 'match_finished') status.value = 'finished'
    }

    socket.onerror = () => {
      connectionError.value = 'اتصال به بازی برقرار نشد. لطفا دوباره تلاش کنید.'
    }

    socket.onclose = (event) => {
      if (status.value !== 'finished' && event.code !== 1000) {
        connectionError.value = 'ارتباط قطع شد. لطفا دوباره تلاش کنید.'
      }
    }
  } catch (err) {
    connectionError.value = 'خطا در برقراری اتصال به بازی.'
  }
})

onUnmounted(() => {
  socket?.close(1000)
})

function confirmLeave() {
  const ok = window.confirm('اگر بازگردید، از بازی دونفره خارج می‌شوید. مطمئن هستید؟')
  if (ok) {
    socket?.close(1000)
    router.push('/home')
  }
}

function handleAnswer(optionId: string) {
  if (!socket || hasAnswered.value) return
  selectedOptionId.value = optionId
  hasAnswered.value = true
  socket.send(
    JSON.stringify({
      type: 'submit_answer',
      questionId: currentQuestion.value?.id,
      selectedOptionId: optionId,
      elapsedMs: 5000,
    })
  )
}
</script>