<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto flex flex-col gap-6">
    <div class="flex items-center">
      <a href="#" class="text-2xl" @click.prevent="confirmLeave">←</a>
    </div>

    <p v-if="status === 'waiting'" class="text-center text-lg flex-1 flex items-center justify-center">
      در انتظار بازیکن دوم...
    </p>

    <div class="flex-1 flex flex-col justify-center gap-6">
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
import { useAuthStore } from '../store/auth.store'

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
const authStore = useAuthStore()
const status = ref<'waiting' | 'in_progress' | 'finished'>('waiting')
const currentQuestion = ref<QuestionData | null>(null)
const selectedOptionId = ref<string | null>(null)
const hasAnswered = ref(false)
let socket: WebSocket | null = null

onMounted(() => {
  const wsBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('https', 'wss')
  const sessionId = route.params.sessionId
  socket = new WebSocket(`${wsBaseUrl}/api/game/duel/${sessionId}/join?playerId=${authStore.user?.id}`)

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'match_started') status.value = 'in_progress'
    if (message.type === 'next_question') hasAnswered.value = false
    if (message.type === 'match_finished') status.value = 'finished'
  }
})

onUnmounted(() => {
  socket?.close()
})

function confirmLeave() {
  const ok = window.confirm('اگر بازگردید، از بازی دونفره خارج می‌شوید. مطمئن هستید؟')
  if (ok) {
    socket?.close()
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
