<template>
  <div class="relative rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 shadow-lg backdrop-blur-sm">
    
    <!-- دکمه گزارش -->
    <button
      v-if="!showReportPanel"
      @click="showReportPanel = true"
      class="absolute top-3 left-3 text-gray-400 hover:text-red-500 transition-colors"
      title="گزارش خطای سوال"
    >
      🚩
    </button>

    <!-- پنل گزارش -->
    <div v-if="showReportPanel" class="absolute inset-0 bg-card-light/95 dark:bg-card-dark/95 z-20 flex flex-col items-center justify-center p-6 rounded-card backdrop-blur-md border border-red-500/30">
      <h3 class="font-bold text-lg mb-4 text-red-500">گزارش این سوال</h3>
      <select v-model="reportReason" class="w-full mb-4 rounded-pill px-4 py-3 bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark outline-none">
        <option value="wrong_answer">پاسخ اشتباه است</option>
        <option value="typo">غلط املایی / نگارشی</option>
        <option value="inappropriate">محتوای نامناسب</option>
        <option value="other">سایر موارد</option>
      </select>
      <div class="flex gap-3 w-full">
        <button @click="submitReport" :disabled="isSubmittingReport" class="flex-1 rounded-pill py-2 bg-red-500 text-white font-bold disabled:opacity-50">
          {{ isSubmittingReport ? '...' : 'ارسال' }}
        </button>
        <button @click="showReportPanel = false" class="flex-1 rounded-pill py-2 border border-border-light dark:border-border-dark font-bold hover:bg-gray-100 dark:hover:bg-gray-800">
          لغو
        </button>
      </div>
      <p v-if="reportMessage" class="mt-4 text-sm font-bold text-center" :class="reportError ? 'text-red-500' : 'text-green-500'">{{ reportMessage }}</p>
    </div>

    <p class="text-lg font-semibold leading-relaxed mb-6 mt-4">{{ question.text }}</p>
    <div class="grid grid-cols-1 gap-3">
      <AnswerButton
        v-for="option in shuffledOptions"
        :key="option.id"
        :text="option.text"
        :state="getOptionState(option.id)"
        :disabled="hasAnswered"
        @select="$emit('answer', option.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { apiClient } from "../services/api-client";
import AnswerButton from "./AnswerButton.vue";

interface QuestionOption { id: string; text: string; }
interface QuestionData { id: string; text: string; options: QuestionOption[]; }

const props = defineProps<{
  question: QuestionData;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  hasAnswered: boolean;
}>();

const emit = defineEmits<{ answer: [optionId: string] }>();

// State
const showReportPanel = ref(false);
const reportReason = ref('wrong_answer');
const reportMessage = ref('');
const reportError = ref(false);
const isSubmittingReport = ref(false);

const shuffledOptions = ref<QuestionOption[]>([]);
let reportTimeoutId: ReturnType<typeof setTimeout> | null = null;

// Methods

/**
 * Fisher-Yates Shuffle Algorithm
 * Pure function to shuffle array without mutating the original prop
 */
const shuffleArray = (array: QuestionOption[]): QuestionOption[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const getOptionState = (optionId: string): "idle" | "selected" | "correct" | "wrong" => {
  if (!props.hasAnswered || !props.correctOptionId) {
    return optionId === props.selectedOptionId ? "selected" : "idle";
  }
  if (optionId === props.correctOptionId) return "correct";
  if (optionId === props.selectedOptionId) return "wrong";
  return "idle";
};

const submitReport = async () => {
  if (isSubmittingReport.value) return; // Prevent double-clicks

  isSubmittingReport.value = true;
  reportMessage.value = '';
  reportError.value = false;

  try {
    await apiClient.post('/api/reports', {
      questionId: props.question.id,
      reason: reportReason.value
    });
    
    reportMessage.value = 'گزارش با موفقیت ثبت شد. با تشکر!';
    
    // Clear previous timeout if exists to prevent memory leaks
    if (reportTimeoutId) clearTimeout(reportTimeoutId);
    
    reportTimeoutId = setTimeout(() => { 
      showReportPanel.value = false; 
      reportMessage.value = ''; 
    }, 2000);

  } catch (err) {
    reportError.value = true;
    reportMessage.value = 'خطا در ثبت گزارش. لطفاً دوباره تلاش کنید.';
  } finally {
    isSubmittingReport.value = false;
  }
};

// Watchers & Lifecycle
watch(
  () => props.question,
  (newQuestion) => {
    if (newQuestion && newQuestion.options) {
      shuffledOptions.value = shuffleArray(newQuestion.options);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (reportTimeoutId) clearTimeout(reportTimeoutId);
});
</script>