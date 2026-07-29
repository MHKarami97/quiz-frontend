<template>
  <div class="min-h-screen max-w-lg mx-auto flex flex-col gap-4 p-4">
    <GameHeader
      :correct-count="correctCount"
      :wrong-count="wrongCount"
      :elapsed-seconds="elapsedSeconds"
      :score="totalScore"
      @leave="confirmLeave"
    />

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

    <div v-else-if="status === 'in_progress'" class="flex-1 flex flex-col justify-center gap-6">
      <p v-if="currentQuestion" class="text-center text-sm text-gray-500 dark:text-gray-400">
        سوال {{ currentIndex }} از {{ totalQuestions }}
      </p>
      <p v-if="lastResult" class="text-center font-bold" :class="lastResult.isCorrect ? 'text-green-500' : 'text-red-500'">
        {{ lastResult.isCorrect ? "آفرین!" : "اشتباه بود" }} ({{ lastResult.pointsAwarded }} امتیاز)
      </p>
      <p v-if="waitingForOpponent" class="text-center text-gray-500">
        در انتظار پاسخ حریف...
      </p>
      <QuestionCard
        v-if="currentQuestion"
        :question="currentQuestion"
        :selected-option-id="selectedOptionId"
        :correct-option-id="revealedCorrectOptionId"
        :has-answered="hasAnswered"
        @answer="handleAnswer"
      />
      <p v-else class="text-center text-gray-500">در انتظار سوال...</p>
    </div>

    <div v-if="status === 'finished'" class="text-center">
      <h2 class="text-2xl font-bold mb-3">بازی دونفره تمام شد!</h2>
      <p class="text-lg mb-4">امتیاز شما: <span class="font-bold text-accent-light dark:text-accent-dark">{{ totalScore }}</span></p>
      <router-link to="/home" class="rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold">
        بازگشت به خانه
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "../services/api-client";
import { useGameStore } from "../store/game.store";
import QuestionCard from "../components/QuestionCard.vue";
import GameHeader from "../components/GameHeader.vue";

interface QuestionOption {
  id: string;
  text: string;
}
interface QuestionData {
  id: string;
  text: string;
  options: QuestionOption[];
}

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

const status = ref<"connecting" | "waiting" | "in_progress" | "finished">("connecting");
const currentQuestion = ref<QuestionData | null>(null);
const selectedOptionId = ref<string | null>(null);
const revealedCorrectOptionId = ref<string | null>(null);
const hasAnswered = ref(false);
const connectionError = ref("");
const lastResult = ref<{ isCorrect: boolean; pointsAwarded: number } | null>(null);
const waitingForOpponent = ref(false);
const totalQuestions = ref(0);
const currentIndex = ref(0);
const questionStartedAt = ref(0);

const correctCount = ref(0);
const wrongCount = ref(0);
const totalScore = ref(0);
const elapsedSeconds = ref(0);

let socket: WebSocket | null = null;
let sessionTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  sessionTimer = setInterval(() => { elapsedSeconds.value += 1; }, 1000);

  const sessionId = route.params.sessionId as string;

  if (!sessionId || sessionId === "undefined") {
    connectionError.value = "شناسه بازی نامعتبر است.";
    return;
  }

  try {
    const { data: ticketData } = await apiClient.post<{ ticket: string }>(
      `/api/game/duel/${sessionId}/ws-ticket`
    );

    const wsBaseUrl = import.meta.env.VITE_API_BASE_URL.replace("https", "wss");
    socket = new WebSocket(
      `${wsBaseUrl}/api/game/duel/${sessionId}/join?ticket=${ticketData.ticket}`
    );

    status.value = "waiting";

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "match_started") {
        status.value = "in_progress";
        currentQuestion.value = message.question ?? null;
        selectedOptionId.value = null;
        revealedCorrectOptionId.value = null;
        hasAnswered.value = false;
        lastResult.value = null;
        waitingForOpponent.value = false;
        totalQuestions.value = message.totalQuestions ?? 0;
        currentIndex.value = (message.questionIndex ?? 0) + 1;
        questionStartedAt.value = Date.now();
      }

      if (message.type === "answer_result") {
        lastResult.value = { isCorrect: message.isCorrect, pointsAwarded: message.pointsAwarded };
        totalScore.value += message.pointsAwarded;

        if (message.correctOptionId) {
          revealedCorrectOptionId.value = message.correctOptionId;
        }

        if (message.isCorrect) {
          correctCount.value += 1;
        } else {
          wrongCount.value += 1;
        }
      }

      if (message.type === "waiting_for_opponent") {
        waitingForOpponent.value = true;
      }

      if (message.type === "next_question") {
        currentQuestion.value = message.question ?? null;
        selectedOptionId.value = null;
        revealedCorrectOptionId.value = null;
        hasAnswered.value = false;
        waitingForOpponent.value = false;
        totalQuestions.value = message.totalQuestions ?? totalQuestions.value;
        currentIndex.value = (message.questionIndex ?? 0) + 1;
        questionStartedAt.value = Date.now();
      }

      if (message.type === "match_finished") {
        status.value = "finished";
        gameStore.markGameFinished();
      }
    };

    socket.onerror = () => {
      connectionError.value = "اتصال به بازی برقرار نشد. لطفا دوباره تلاش کنید.";
    };

    socket.onclose = (event) => {
      if (status.value !== "finished" && event.code !== 1000) {
        connectionError.value = "ارتباط قطع شد. لطفا دوباره تلاش کنید.";
      }
    };
  } catch (err) {
    connectionError.value = "خطا در برقراری اتصال به بازی.";
  }
});

onUnmounted(() => {
  socket?.close(1000);
  if (sessionTimer) clearInterval(sessionTimer);
});

function confirmLeave() {
  const ok = window.confirm("اگر بازگردید، از بازی دونفره خارج می‌شوید. مطمئن هستید؟");
  if (ok) {
    socket?.close(1000);
    if (sessionTimer) clearInterval(sessionTimer);
    gameStore.markGameFinished();
    router.push("/home");
  }
}

function handleAnswer(optionId: string) {
  if (!socket || hasAnswered.value || !currentQuestion.value) return;
  
  selectedOptionId.value = optionId;
  hasAnswered.value = true;
  const elapsedMs = Date.now() - questionStartedAt.value;

  socket.send(
    JSON.stringify({
      type: "submit_answer",
      questionId: currentQuestion.value.id,
      selectedOptionId: optionId,
      elapsedMs,
    })
  );
}
</script>