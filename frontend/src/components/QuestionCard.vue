<template>
  <div class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 shadow-lg backdrop-blur-sm">
    <p class="text-lg font-semibold leading-relaxed mb-6">{{ question.text }}</p>
    <div class="grid grid-cols-1 gap-3">
      <AnswerButton
        v-for="option in question.options"
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
import { computed } from "vue";
import AnswerButton from "./AnswerButton.vue";

interface QuestionOption { id: string; text: string; }
interface QuestionData { id: string; text: string; options: QuestionOption[]; }

const props = defineProps<{
  question: QuestionData;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  hasAnswered: boolean;
}>();
defineEmits<{ answer: [optionId: string] }>();

function getOptionState(optionId: string): "idle" | "selected" | "correct" | "wrong" {
  if (!props.hasAnswered) {
    return optionId === props.selectedOptionId ? "selected" : "idle";
  }
  if (props.correctOptionId && optionId === props.correctOptionId) return "correct";
  if (optionId === props.selectedOptionId) return "wrong";
  return "idle";
}
</script>