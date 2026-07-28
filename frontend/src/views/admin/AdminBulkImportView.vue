<template>
  <div class="max-w-2xl">
    <h2 class="text-2xl font-bold mb-2">وارد کردن گروهی سؤالات</h2>
    <p class="text-sm text-gray-500 mb-6">
      یک آرایه JSON از سؤالات را وارد کنید. هر سؤال باید شامل categoryId، text، options (دقیقاً ۴ گزینه با id و text)، correctOptionId و difficulty باشد.
    </p>

    <details class="mb-4 rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
      <summary class="cursor-pointer font-bold">نمونه فرمت JSON</summary>
      <pre class="text-xs overflow-auto mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg" dir="ltr">{{ sampleJson }}</pre>
    </details>

    <textarea
      v-model="jsonInput"
      rows="12"
      placeholder="آرایه JSON سؤالات را اینجا paste کنید..."
      dir="ltr"
      class="w-full rounded-card px-4 py-3 bg-transparent border border-border-light dark:border-border-dark font-mono text-sm"
    ></textarea>

    <p v-if="errorMessage" class="text-red-500 mt-3">{{ errorMessage }}</p>

    <div v-if="importResult" class="mt-4 rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
      <p class="font-bold text-green-600">{{ importResult.created }} سؤال با موفقیت اضافه شد</p>
      <p v-if="importResult.failed > 0" class="text-red-500 mt-1">{{ importResult.failed }} سؤال ناموفق بود:</p>
      <ul class="text-xs text-red-500 list-disc pr-5 mt-1">
        <li v-for="(e, i) in importResult.errors" :key="i">{{ e }}</li>
      </ul>
    </div>

    <div class="flex gap-3 mt-4">
      <button @click="handleImport" :disabled="isSubmitting" class="flex-1 rounded-pill py-3 bg-accent-light dark:bg-accent-dark text-white font-bold disabled:opacity-50">
        {{ isSubmitting ? "در حال وارد کردن..." : "وارد کردن سؤالات" }}
      </button>
      <router-link to="/admin/questions" class="flex-1 text-center rounded-pill py-3 border border-border-light dark:border-border-dark font-bold">
        بازگشت
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { adminApi } from "../../services/admin-api";

const jsonInput = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const importResult = ref<{ created: number; failed: number; errors: string[] } | null>(null);

const sampleJson = `[
  {
    "categoryId": "general",
    "text": "پایتخت ایران کدام شهر است؟",
    "options": [
      { "id": "a", "text": "تهران" },
      { "id": "b", "text": "اصفهان" },
      { "id": "c", "text": "شیراز" },
      { "id": "d", "text": "مشهد" }
    ],
    "correctOptionId": "a",
    "difficulty": "easy"
  }
]`;

async function handleImport() {
  errorMessage.value = "";
  importResult.value = null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonInput.value);
  } catch {
    errorMessage.value = "متن وارد‌شده یک JSON معتبر نیست";
    return;
  }
  if (!Array.isArray(parsed)) {
    errorMessage.value = "ورودی باید یک آرایه از سؤالات باشد";
    return;
  }

  isSubmitting.value = true;
  try {
    const { data } = await adminApi.bulkImportQuestions(parsed as any);
    importResult.value = data;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در وارد کردن سؤالات";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
