<template>
  <div
    class="min-h-screen p-6 max-w-lg mx-auto flex flex-col justify-center gap-6"
  >
    <div v-if="loadError" class="text-center">
      <p class="text-lg font-bold text-red-500 mb-3">{{ loadError }}</p>
      <router-link
        to="/home"
        class="inline-block rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold"
      >
        بازگشت به خانه
      </router-link>
    </div>

    <template v-else>
      <CircularTimer
        v-if="currentQuestion"
        :seconds-left="secondsLeft"
        :total-seconds="15"
        :size="80"
      />
      <QuestionCard
        v-if="currentQuestion"
        :question="currentQuestion"
        :selected-option-id="selectedOptionId"
        :correct-option-id="lastCorrectOptionId"
        :has-answered="hasAnswered"
        @answer="handleAnswer"
      />

      <div v-if="hasAnswered" class="text-center">
        <p
          class="text-lg font-bold"
          :class="lastWasCorrect ? 'text-green-500' : 'text-red-500'"
        >
          {{ lastWasCorrect ? "آفرین!" : "اشتباه بود" }} ({{
            lastPoints
          }}
          امتیاز)
        </p>
        <button
          class="mt-3 rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold"
          @click="nextStep"
        >
          {{ hasNext ? "سوال بعدی" : "پایان" }}
        </button>
      </div>

      <div v-if="isFinished" class="text-center">
        <h2 class="text-2xl font-bold mb-3">بازی تمام شد!</h2>
        <router-link to="/home" class="text-accent-light dark:text-accent-dark"
          >بازگشت به خانه</router-link
        >
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { apiClient } from "../services/api-client";
import QuestionCard from "../components/QuestionCard.vue";
import CircularTimer from "../components/CircularTimer.vue";

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
const loadError = ref("");
const questionStartedAt = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;
let nextQuestionCache: QuestionData | null = null;

onMounted(async () => {
  try {
    const data = await apiClient.post<{
      sessionId: string;
      firstQuestion: QuestionData;
      totalQuestions: number;
    }>("/api/game/solo/start", { categoryId: route.params.categoryId });

    sessionId.value = data.data.sessionId;
    currentQuestion.value = data.data.firstQuestion;
    startTimer();
  } catch (err) {
    // این دسته‌بندی سوالی ندارد یا خطای شبکه رخ داده — به‌جای صفحه سفید، پیام واضح نشان می‌دهیم
    loadError.value =
      err instanceof Error && err.message.includes("No questions available")
        ? "این دسته‌بندی هنوز سوالی ندارد. لطفا دسته‌بندی دیگری را انتخاب کنید."
        : "خطا در شروع بازی. لطفا دوباره تلاش کنید.";
  }
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

  try {
    const data = await apiClient.post<{
      isCorrect: boolean;
      pointsAwarded: number;
      hasNext: boolean;
      nextQuestion: QuestionData | null;
    }>("/api/game/solo/answer", {
      sessionId: sessionId.value,
      questionId: currentQuestion.value.id,
      selectedOptionId: optionId,
      elapsedMs,
    });

    hasAnswered.value = true;
    lastWasCorrect.value = data.data.isCorrect;
    lastPoints.value = data.data.pointsAwarded;
    hasNext.value = data.data.hasNext;
    lastCorrectOptionId.value = data.data.isCorrect ? optionId : null;
    nextQuestionCache = data.data.nextQuestion;
  } catch (err) {
    loadError.value = "خطا در ثبت پاسخ. لطفا دوباره تلاش کنید.";
  }
}

function nextStep() {
  if (!hasNext.value || !nextQuestionCache) {
    isFinished.value = true;
    return;
  }
  currentQuestion.value = nextQuestionCache;
  selectedOptionId.value = null;
  lastCorrectOptionId.value = null;
  hasAnswered.value = false;
  startTimer();
}
</script>
