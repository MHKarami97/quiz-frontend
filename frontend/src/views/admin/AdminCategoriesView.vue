<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">دسته‌بندی‌ها</h2>
      <button class="rounded-pill px-4 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold" @click="openCreateForm">
        ➕ دسته‌بندی جدید
      </button>
    </div>

    <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>

    <div v-if="isFormOpen" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 mb-6">
      <h3 class="font-bold mb-3">{{ editingId ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید" }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input v-model="form.name" placeholder="نام دسته‌بندی" class="rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark" />
        <input v-model="form.icon" placeholder="آیکون (مثلاً 🧠)" class="rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark" />
        <div class="flex gap-2">
          <button class="flex-1 rounded-pill py-2 bg-accent-light dark:bg-accent-dark text-white font-bold" @click="submitForm">ذخیره</button>
          <button class="flex-1 rounded-pill py-2 border border-border-light dark:border-border-dark" @click="closeForm">انصراف</button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center text-gray-500">در حال بارگذاری...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-for="cat in categories" :key="cat.id" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-2xl">{{ cat.icon }}</span>
          <div>
            <div class="font-bold">{{ cat.name }}</div>
            <div class="text-sm text-gray-500">{{ cat.questionCount }} سؤال</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="text-accent-light dark:text-accent-dark" @click="openEditForm(cat)">✏️</button>
          <button class="text-red-500" @click="handleDelete(cat.id)">🗑️</button>
        </div>
      </div>
      <p v-if="categories.length === 0" class="text-gray-500 col-span-2 text-center py-8">هنوز دسته‌بندی‌ای ساخته نشده است.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { adminApi, AdminCategory } from "../../services/admin-api";

const categories = ref<AdminCategory[]>([]);
const isLoading = ref(true);
const isFormOpen = ref(false);
const editingId = ref<string | null>(null);
const errorMessage = ref("");
const form = ref({ name: "", icon: "🧠" });

async function loadCategories() {
  isLoading.value = true;
  try {
    const { data } = await adminApi.listCategories();
    categories.value = data;
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCategories);

function openCreateForm() {
  editingId.value = null;
  form.value = { name: "", icon: "🧠" };
  isFormOpen.value = true;
  errorMessage.value = "";
}

function openEditForm(cat: AdminCategory) {
  editingId.value = cat.id;
  form.value = { name: cat.name, icon: cat.icon };
  isFormOpen.value = true;
  errorMessage.value = "";
}

function closeForm() {
  isFormOpen.value = false;
  errorMessage.value = "";
}

async function submitForm() {
  errorMessage.value = "";
  if (!form.value.name.trim()) {
    errorMessage.value = "نام دسته‌بندی الزامی است";
    return;
  }
  try {
    if (editingId.value) {
      await adminApi.updateCategory(editingId.value, form.value.name, form.value.icon);
    } else {
      await adminApi.createCategory(form.value.name, form.value.icon);
    }
    closeForm();
    await loadCategories();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در ذخیره‌سازی";
  }
}

async function handleDelete(id: string) {
  if (!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return;
  errorMessage.value = "";
  try {
    await adminApi.deleteCategory(id);
    await loadCategories();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در حذف";
  }
}
</script>
