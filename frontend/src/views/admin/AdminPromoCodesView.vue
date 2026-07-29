<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">کدهای تخفیف</h2>
      <button class="rounded-pill px-4 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold" @click="openCreateForm">
        ➕ کد جدید
      </button>
    </div>

    <p class="text-sm text-gray-500 mb-4">
      توجه: در حال حاضر فقط کدهای تخفیف ۱۰۰٪ قابل استفاده هستند، چون درگاه پرداخت غیرفعال است.
    </p>

    <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>

    <div v-if="isFormOpen" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 mb-6">
      <h3 class="font-bold mb-3">{{ editingId ? "ویرایش کد تخفیف" : "کد تخفیف جدید" }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input v-model="form.code" :disabled="!!editingId" placeholder="کد (مثلاً WELCOME100)" dir="ltr" class="rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark disabled:opacity-50" />
        <input v-model.number="form.discountPercent" type="number" min="1" max="100" placeholder="درصد تخفیف" class="rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark" />
        <input v-model.number="form.maxUses" type="number" min="1" placeholder="حداکثر استفاده" class="rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark" />
        <label v-if="editingId" class="flex items-center gap-2">
          <input type="checkbox" v-model="form.isActive" />
          فعال
        </label>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="rounded-pill px-6 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold" @click="submitForm">ذخیره</button>
        <button class="rounded-pill px-6 py-2 border border-border-light dark:border-border-dark" @click="closeForm">انصراف</button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center text-gray-500">در حال بارگذاری...</div>

    <div v-else class="space-y-2">
      <div v-for="p in promoCodes" :key="p.id" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 flex justify-between items-center flex-wrap gap-2">
        <div>
          <div class="font-bold font-mono" dir="ltr">{{ p.code }}</div>
          <div class="text-sm text-gray-500">
            {{ p.discountPercent }}٪ تخفیف · {{ p.useCount }} از {{ p.maxUses }} استفاده‌شده ·
            <span :class="p.isActive ? 'text-green-600' : 'text-red-500'">{{ p.isActive ? "فعال" : "غیرفعال" }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="text-accent-light dark:text-accent-dark" @click="openEditForm(p)">✏️</button>
          <button class="text-red-500" @click="handleDelete(p.id)">🗑️</button>
        </div>
      </div>
      <p v-if="promoCodes.length === 0" class="text-gray-500 text-center py-8">هنوز کد تخفیفی ساخته نشده است.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { adminApi, AdminPromoCode } from "../../services/admin-api";

const promoCodes = ref<AdminPromoCode[]>([]);
const isLoading = ref(true);
const isFormOpen = ref(false);
const editingId = ref<string | null>(null);
const errorMessage = ref("");
const form = ref({ code: "", discountPercent: 100, maxUses: 100, isActive: true });

async function loadPromoCodes() {
  isLoading.value = true;
  try {
    const { data } = await adminApi.listPromoCodes();
    promoCodes.value = data;
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadPromoCodes);

function openCreateForm() {
  editingId.value = null;
  form.value = { code: "", discountPercent: 100, maxUses: 100, isActive: true };
  isFormOpen.value = true;
  errorMessage.value = "";
}

function openEditForm(p: AdminPromoCode) {
  editingId.value = p.id;
  form.value = { code: p.code, discountPercent: p.discountPercent, maxUses: p.maxUses, isActive: p.isActive };
  isFormOpen.value = true;
  errorMessage.value = "";
}

function closeForm() {
  isFormOpen.value = false;
  errorMessage.value = "";
}

async function submitForm() {
  errorMessage.value = "";
  if (!form.value.code.trim() && !editingId.value) {
    errorMessage.value = "کد تخفیف الزامی است";
    return;
  }
  try {
    if (editingId.value) {
      await adminApi.updatePromoCode(editingId.value, form.value.discountPercent, form.value.maxUses, form.value.isActive);
    } else {
      await adminApi.createPromoCode(form.value.code, form.value.discountPercent, form.value.maxUses);
    }
    closeForm();
    await loadPromoCodes();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در ذخیره‌سازی";
  }
}

async function handleDelete(id: string) {
  if (!confirm("آیا از حذف این کد تخفیف مطمئن هستید؟")) return;
  errorMessage.value = "";
  try {
    await adminApi.deletePromoCode(id);
    await loadPromoCodes();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در حذف";
  }
}
</script>