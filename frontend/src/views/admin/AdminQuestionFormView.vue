<template>
  <div class="max-w-2xl">
    <h2 class="text-2xl font-bold mb-6">{{ isEditMode ? "ویرایش سؤال" : "سؤال جدید" }}</h2>

    <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>
    <p v-if="isLoading" class="text-gray-500">در حال بارگذاری...</p>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">دسته‌بندی</label>
        <select v-model="form.categoryId" required class="w-full rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark">
          <option value="" disabled>انتخاب دسته‌بندی</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">متن سؤال</label>
        <textarea v-model="form.text" required rows="3" class="w-full rounded-card px-4 py-2 bg-transparent border border-border-light dark:border-border-dark"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">گزینه‌ها (گزینه درست را انتخاب کنید)</label>
        <div v-for="(opt, index) in form.options" :key="opt.id" class="flex items-center gap-3 mb-2">
          <input type="radio" :value="opt.id" v-model="form.correctOptionId" name="correctOption" class="shrink-0" />
          <input
            v-model="opt.text"
            required
            :placeholder="`گزینه ${index + 1}`"
            class="flex-1 rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">سطح سختی</label>
        <select v-model="form.difficulty" class="w-full rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark">
          <option value="easy">آسان</option>
          <option value="medium">متوسط</option>
          <option value="hard">سخت</option>
        </select>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="isSubmitting" class="flex-1 rounded-pill py-3 bg-accent-light dark:bg-accent-dark text-white font-bold disabled:opacity-50">
          {{ isSubmitting ? "در حال ذخیره..." : "ذخیره سؤال" }}
        </button>
        <router-link to="/admin/questions" class="flex-1 text-center rounded-pill py-3 border border-border-light dark:border-border-dark font-bold">
          انصراف
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminApi, AdminCategory } from "../../services/admin-api";

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const questionId = computed(() => route.params.id as string | undefined);

const categories = ref<AdminCategory[]>([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");

function freshOptions() {
  return [
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ];
}

const form = ref({
  categoryId: "",
  text: "",
  options: freshOptions(),
  correctOptionId: "a",
  difficulty: "medium" as "easy" | "medium" | "hard",
});

onMounted(async () => {
  try {
    const { data } = await adminApi.listCategories();
    categories.value = data;

    if (isEditMode.value && questionId.value) {
      const { data: question } = await adminApi.getQuestion(questionId.value);
      form.value = {
        categoryId: question.categoryId,
        text: question.text,
        options: question.options,
        correctOptionId: question.correctOptionId,
        difficulty: question.difficulty,
      };
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در بارگذاری اطلاعات";
  } finally {
    isLoading.value = false;
  }
});

async function handleSubmit() {
  errorMessage.value = "";
  if (form.value.options.some(o => !o.text.trim())) {
    errorMessage.value = "همه گزینه‌ها باید پر شوند";
    return;
  }
  isSubmitting.value = true;
  try {
    if (isEditMode.value && questionId.value) {
      await adminApi.updateQuestion(questionId.value, form.value);
    } else {
      await adminApi.createQuestion(form.value);
    }
    router.push("/admin/questions");
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در ذخیره‌سازی سؤال";
  } finally {
    isSubmitting.value = false;
  }
}
</script>