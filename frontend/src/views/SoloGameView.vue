<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto flex flex-col justify-center gap-6">
    <CircularTimer v-if="currentQuestion" :seconds-left="secondsLeft" :total-seconds="15" :size="80" />

    <QuestionCard
      v-if="currentQuestion"
      :question="currentQuestion"
      :selected-option-id="selectedOptionId"
      :correct-option-id="lastCorrectOptionId"
      :has-answered="hasAnswered"
      @answer="handleAnswer"
    />

    <div v-if="hasAnswered" class="text-center">
      <p class="text-lg font-bold" :class="lastWasCorrect ? 'text-green-500' : 'text-red-500'">
        {{ lastWasCorrect ? `+${lastPoints} امتیاز` : "پاسخ نادرست" }}
      </p>
      <button class="mt-3 rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold" @click="nextStep">
        {{ hasNext ? "سوال بعدی" : "پایان بازی" }}
      </button>
    </div>

    <div v-if="isFinished" class="text-center">
      <h2 class="text-2xl font-bold">بازی تمام شد! 🎉</h2>
      <router-link to="/home" class="text-accent-light dark:text-accent-dark">بازگشت به خانه</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { apiClient } from "../services/api-client";
import QuestionCard from "../components/QuestionCard.vue";
import CircularTimer from "../components/CircularTimer.vue";

interface QuestionOption { id: string; text: string; }
interface QuestionData { id: string; text: string; options: QuestionOption[]; }

const route = useRoute();
const sessionId = ref("");
const currentQuestion = ref<QuestionData | null>(null);
const selectedOptionId = ref<string | null>(null);
const lastCorrectOptionId = ref<string | null>(null);
const hasAnswered = ref(false);
const hasNext = ref(true);
const isFinished = ref(false);
const lastWasCorrect = ref(false);
const lastPoints = ref(0);
const secondsLeft = ref(15);
const questionStartedAt = ref(0);

let timerInterval: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  const { data } = await apiClient.post("/api/game/solo/start", { categoryId: route.params.categoryId });
  sessionId.value = data.sessionId;
  currentQuestion.value = data.firstQuestion;
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function startTimer() {
  secondsLeft.value = 15;
  questionStartedAt.value = Date.now();
  timerInterval = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0 && !hasAnswered.value) {
      handleAnswer(null);
    }
  }, 1000);
}

async function handleAnswer(optionId: string | null) {
  if (hasAnswered.value || !currentQuestion.value) return;
  if (timerInterval) clearInterval(timerInterval);

  selectedOptionId.value = optionId;
  const elapsedMs = Date.now() - questionStartedAt.value;

  const { data } = await apiClient.post("/api/game/solo/answer", {
    sessionId: sessionId.value,
    questionId: currentQuestion.value.id,
    selectedOptionId: optionId,
    elapsedMs,
  });

  hasAnswered.value = true;
  lastWasCorrect.value = data.isCorrect;
  lastPoints.value = data.pointsAwarded;
  hasNext.value = data.hasNext;
  lastCorrectOptionId.value = data.isCorrect ? optionId : null;

  if (data.nextQuestion) {
    (window as any).__nextQuestion = data.nextQuestion;
  }
}

function nextStep() {
  const next = (window as any).__nextQuestion;
  if (!hasNext.value || !next) {
    isFinished.value = true;
    return;
  }
  currentQuestion.value = next;
  selectedOptionId.value = null;
  lastCorrectOptionId.value = null;
  hasAnswered.value = false;
  startTimer();
}
</script>
