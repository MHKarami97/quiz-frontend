<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">بررسی گزارش‌های کاربران</h2>
    
    <div class="flex gap-4 mb-6">
      <select v-model="filterStatus" @change="loadReports" class="rounded-pill px-4 py-2 border border-border-light dark:border-border-dark bg-transparent">
        <option value="pending">در انتظار بررسی</option>
        <option value="resolved">اصلاح و حل شده</option>
        <option value="dismissed">رد شده (نامعتبر)</option>
      </select>
    </div>

    <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>
    <div v-if="isLoading" class="text-center text-gray-500 py-8">در حال بارگذاری...</div>
    
    <div v-else class="space-y-4">
      <div v-for="r in reports" :key="r.id" class="rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5">
        <div class="flex justify-between items-start mb-2">
          <div class="font-bold text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-pill">
            دلیل: {{ formatReason(r.reason) }}
          </div>
          <div class="text-xs text-gray-500">گزارش‌دهنده: {{ r.userName }}</div>
        </div>
        
        <p class="text-lg font-semibold my-4 pr-2 border-r-4 border-accent-light dark:border-accent-dark">{{ r.questionText }}</p>
        
        <div class="flex flex-wrap gap-2 mt-4" v-if="r.status === 'pending'">
          <router-link :to="`/admin/questions/${r.questionId}/edit`" class="rounded-pill px-5 py-2 bg-accent-light dark:bg-accent-dark text-white text-sm font-bold shadow-sm">
            ✏️ ویرایش سوال
          </router-link>
          <button @click="updateStatus(r.id, 'resolved')" class="rounded-pill px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors">
            ✅ حل شد
          </button>
          <button @click="updateStatus(r.id, 'dismissed')" class="rounded-pill px-5 py-2 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold transition-colors">
            ❌ گزارش نامعتبر
          </button>
        </div>
        <div v-else class="text-sm font-bold px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-pill inline-block" :class="r.status === 'resolved' ? 'text-green-500' : 'text-gray-500'">
          وضعیت فعلی: {{ r.status === 'resolved' ? '✅ بررسی و حل شده' : '❌ رد شده' }}
        </div>
      </div>
      <p v-if="reports.length === 0" class="text-gray-500 text-center py-8">گزارشی در این وضعیت یافت نشد.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi, AdminReport } from '../../services/admin-api';

const reports = ref<AdminReport[]>([]);
const filterStatus = ref('pending');
const isLoading = ref(true);
const errorMessage = ref('');

function formatReason(reason: string) {
  const map: Record<string, string> = { 
    wrong_answer: 'پاسخ اشتباه تعیین شده', 
    typo: 'غلط املایی یا نگارشی', 
    inappropriate: 'محتوای نامناسب', 
    other: 'سایر موارد' 
  };
  return map[reason] || reason;
}

async function loadReports() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const { data } = await adminApi.listReports(1, filterStatus.value);
    reports.value = data.items;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'خطا در بارگذاری گزارش‌ها';
  } finally {
    isLoading.value = false;
  }
}

async function updateStatus(id: string, status: 'resolved' | 'dismissed') {
  if (!confirm(`آیا از تغییر وضعیت به "${status === 'resolved' ? 'حل شده' : 'رد شده'}" مطمئن هستید؟`)) return;
  try {
    await adminApi.updateReportStatus(id, status);
    await loadReports();
  } catch (err) {
    errorMessage.value = 'خطا در اعمال تغییر وضعیت';
  }
}

onMounted(loadReports);
</script>