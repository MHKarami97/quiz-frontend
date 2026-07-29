<template>
  <div>
    <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
      <h2 class="text-2xl font-bold">سؤالات</h2>
      <div class="flex gap-2">
        <router-link to="/admin/questions/bulk-import" class="rounded-pill px-4 py-2 border border-border-light dark:border-border-dark font-bold">
          📥 وارد کردن گروهی
        </router-link>
        <router-link to="/admin/questions/new" class="rounded-pill px-4 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold">
          ➕ سؤال جدید
        </router-link>
      </div>
    </div>

    <input
      v-model="searchQuery"
      @input="onSearchChanged"
      placeholder="جستجو در متن سؤالات..."
      class="w-full rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark mb-4"
    />

    <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>

    <div v-if="isLoading" class="text-center text-gray-500">در حال بارگذاری...</div>

    <div v-else>
      <div class="space-y-2">
        <div v-for="q in questions" :key="q.id" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 flex justify-between items-center gap-3">
          <div class="min-w-0">
            <div class="font-medium truncate">{{ q.text }}</div>
            <div class="text-xs text-gray-500 mt-1">سختی: {{ difficultyLabel(q.difficulty) }}</div>
          </div>
          <div class="flex gap-2 shrink-0">
            <router-link :to="`/admin/questions/${q.id}/edit`" class="text-accent-light dark:text-accent-dark">✏️</router-link>
            <button class="text-red-500" @click="handleDelete(q.id)">🗑️</button>
          </div>
        </div>
        <p v-if="questions.length === 0" class="text-gray-500 text-center py-8">سؤالی یافت نشد.</p>
      </div>

      <div class="flex justify-center gap-2 mt-6" v-if="totalPages > 1">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="goToPage(p)"
          class="w-9 h-9 rounded-full font-bold"
          :class="p === page ? 'bg-accent-light dark:bg-accent-dark text-white' : 'border border-border-light dark:border-border-dark'"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { adminApi, AdminQuestion } from "../../services/admin-api";

const questions = ref<AdminQuestion[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const searchQuery = ref("");
const page = ref(1);
const total = ref(0);
const pageSize = 20;

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

function difficultyLabel(d: string) {
  return d === "easy" ? "آسان" : d === "hard" ? "سخت" : "متوسط";
}

async function loadQuestions() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const { data } = await adminApi.listQuestions(page.value, searchQuery.value || undefined);
    questions.value = data.items;
    total.value = data.total;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در بارگذاری سؤالات";
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadQuestions);

let searchTimeout: ReturnType<typeof setTimeout>;
function onSearchChanged() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadQuestions();
  }, 400);
}

function goToPage(p: number) {
  page.value = p;
  loadQuestions();
}

async function handleDelete(id: string) {
  if (!confirm("آیا از حذف این سؤال مطمئن هستید؟")) return;
  errorMessage.value = "";
  try {
    await adminApi.deleteQuestion(id);
    await loadQuestions();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در حذف";
  }
}
</script>