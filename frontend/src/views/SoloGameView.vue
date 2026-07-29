<template>
  <div class="min-h-screen max-w-lg mx-auto flex flex-col gap-4 p-4">
    <GameHeader
      :correct-count="correctCount"
      :wrong-count="wrongCount"
      :elapsed-seconds="elapsedSeconds"
      :score="totalScore"
      @leave="confirmLeave"
    />

    <div v-if="loadError" class="flex-1 flex flex-col items-center justify-center text-center">
      <p class="text-lg font-bold text-red-500 mb-3">{{ loadError }}</p>
      <router-link
        to="/home"
        class="inline-block rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold"
      >
        بازگشت به خانه
      </router-link>
    </div>

    <template v-else>
      <div class="flex-1 flex flex-col justify-center gap-6">
        <p v-if="currentQuestion" class="text-center text-sm text-gray-500 dark:text-gray-400">
          سوال {{ currentIndex }} از {{ totalQuestions }}
        </p>
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

        <div v-if="hasAnswered && lastCorrectOptionId" class="text-center">
          <p
            class="text-lg font-bold"
            :class="lastWasCorrect ? 'text-green-500' : 'text-red-500'"
          >
            {{ lastWasCorrect ? "آفرین!" : "اشتباه بود" }} ({{ lastPoints }} امتیاز)
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
          <p class="text-lg mb-4">امتیاز کل: <span class="font-bold text-accent-light dark:text-accent-dark">{{ totalScore }}</span></p>
          <router-link to="/home" class="rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold">
            بازگشت به خانه
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "../services/api-client";
import { useGameStore } from "../store/game.store";
import QuestionCard from "../components/QuestionCard.vue";
import CircularTimer from "../components/CircularTimer.vue";
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
const totalQuestions = ref(0);
const currentIndex = ref(0);
const correctCount = ref(0);
const wrongCount = ref(0);
const totalScore = ref(0);
const elapsedSeconds = ref(0);

let timerInterval: ReturnType<typeof setInterval> | null = null;
let sessionTimer: ReturnType<typeof setInterval> | null = null;
let nextQuestionCache: QuestionData | null = null;

onMounted(async () => {
  sessionTimer = setInterval(() => { elapsedSeconds.value += 1; }, 1000);

  try {
    const { data } = await apiClient.post<{
      sessionId: string;
      firstQuestion: QuestionData;
      totalQuestions: number;
    }>("/api/game/solo/start", { categoryId: route.params.categoryId });

    sessionId.value = data.sessionId;
    currentQuestion.value = data.firstQuestion;
    totalQuestions.value = data.totalQuestions;
    currentIndex.value = 1;
    startTimer();
  } catch (err) {
    loadError.value =
      err instanceof Error && err.message.includes("No questions available")
        ? "این دسته‌بندی هنوز سوالی ندارد. لطفا دسته‌بندی دیگری را انتخاب کنید."
        : "خطا در شروع بازی. لطفا دوباره تلاش کنید.";
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (sessionTimer) clearInterval(sessionTimer);
});

function confirmLeave() {
  const inMiddleOfGame = !isFinished.value && currentQuestion.value && !loadError.value;
  if (inMiddleOfGame) {
    const ok = window.confirm("اگر بازگردید، این بازی نیمه‌کاره می‌ماند. مطمئن هستید؟");
    if (!ok) return;
  }
  if (timerInterval) clearInterval(timerInterval);
  if (sessionTimer) clearInterval(sessionTimer);
  
  gameStore.markGameFinished();
  router.push("/home");
}

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
  hasAnswered.value = true; // این خط قبل از گرفتن پاسخ جابجا شده تا از کلیک مجدد جلوگیری و سرعت گرافیکی را بالا ببرد
  const elapsedMs = Date.now() - questionStartedAt.value;

  try {
    const { data } = await apiClient.post<{
      isCorrect: boolean;
      pointsAwarded: number;
      hasNext: boolean;
      nextQuestion: QuestionData | null;
      correctOptionId: string;
    }>("/api/game/solo/answer", {
      sessionId: sessionId.value,
      questionId: currentQuestion.value.id,
      selectedOptionId: optionId,
      elapsedMs,
    });

    lastWasCorrect.value = data.isCorrect;
    lastPoints.value = data.pointsAwarded;
    hasNext.value = data.hasNext;
    totalScore.value += data.pointsAwarded;
    lastCorrectOptionId.value = data.correctOptionId;
    nextQuestionCache = data.nextQuestion;

    if (data.isCorrect) {
      correctCount.value += 1;
    } else {
      wrongCount.value += 1;
    }
  } catch (err) {
    loadError.value = "خطا در ثبت پاسخ. لطفا دوباره تلاش کنید.";
  }
}

function nextStep() {
  if (!hasNext.value || !nextQuestionCache) {
    isFinished.value = true;
    gameStore.markGameFinished();
    return;
  }
  currentQuestion.value = nextQuestionCache;
  selectedOptionId.value = null;
  lastCorrectOptionId.value = null;
  hasAnswered.value = false;
  currentIndex.value += 1;
  startTimer();
}
</script>