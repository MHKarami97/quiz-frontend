<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto flex flex-col justify-center gap-6">
    <p v-if="status === 'waiting'" class="text-center text-lg">در انتظار حریف... ⏳</p>

    <QuestionCard
      v-if="currentQuestion && status === 'in_progress'"
      :question="currentQuestion"
      :selected-option-id="selectedOptionId"
      :correct-option-id="null"
      :has-answered="hasAnswered"
      @answer="handleAnswer"
    />

    <p v-if="status === 'finished'" class="text-center text-2xl font-bold">مسابقه تمام شد! 🏆</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../store/auth.store";

interface QuestionOption { id: string; text: string; }
interface QuestionData { id: string; text: string; options: QuestionOption[]; }

const route = useRoute();
const authStore = useAuthStore();
const status = ref<"waiting" | "in_progress" | "finished">("waiting");
const currentQuestion = ref<QuestionData | null>(null);
const selectedOptionId = ref<string | null>(null);
const hasAnswered = ref(false);
let socket: WebSocket | null = null;

// NOTE: Durable Object WebSocket connection. If migrating away from
// Cloudflare later, only this connection URL and message shape need
// to match your new Socket.IO/ws server — GameSession/GameEngine
// domain logic on the backend stays identical.
onMounted(() => {
  const wsBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace("https://", "wss://");
  const sessionId = route.params.sessionId;
  socket = new WebSocket(`${wsBaseUrl}/api/game/duel/${sessionId}/join?playerId=${authStore.user?.id}`);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "match_started") status.value = "in_progress";
    if (message.type === "next_question") hasAnswered.value = false;
    if (message.type === "match_finished") status.value = "finished";
  };
});

onUnmounted(() => socket?.close());

function handleAnswer(optionId: string) {
  if (!socket || hasAnswered.value) return;
  selectedOptionId.value = optionId;
  hasAnswered.value = true;
  socket.send(JSON.stringify({
    type: "submit_answer",
    questionId: currentQuestion.value?.id,
    selectedOptionId: optionId,
    elapsedMs: 5000,
  }));
}
</script>
