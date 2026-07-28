<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto pb-24">
    <h1 class="text-2xl font-bold mb-6">تنظیمات</h1>

    <section class="mb-6">
      <h2 class="font-semibold mb-3">پوسته</h2>
      <div class="flex gap-2">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          class="flex-1 rounded-pill py-2 border"
          :class="themeStore.mode === option.value ? 'bg-accent-light dark:bg-accent-dark text-white' : 'border-border-light dark:border-border-dark'"
          @click="themeStore.setMode(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="font-semibold mb-3">فعال‌سازی کد تخفیف</h2>
      <div class="flex gap-2">
        <input v-model="promoCode" placeholder="کد تخفیف را وارد کنید"
          class="flex-1 rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark" />
        <button class="rounded-pill px-4 py-2 bg-accent-light dark:bg-accent-dark text-white" @click="redeemCode">
          فعال‌سازی
        </button>
      </div>
      <p v-if="promoMessage" class="mt-2 text-sm">{{ promoMessage }}</p>
    </section>

    <section class="mb-6">
      <h2 class="font-semibold mb-3">خرید سکه</h2>
      <button disabled class="w-full rounded-pill py-3 bg-gray-400 text-white cursor-not-allowed">
        خرید با درگاه (غیرفعال است)
      </button>
      <p class="text-sm text-gray-500 mt-2">
        درگاه پرداخت هنوز فعال نشده است. برای دریافت سکه از کد تخفیف استفاده کنید.
      </p>
    </section>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useThemeStore } from "../store/theme.store";
import { apiClient } from "../services/api-client";
import BottomNav from "../components/BottomNav.vue";

const themeStore = useThemeStore();
const promoCode = ref("");
const promoMessage = ref("");

const themeOptions = [
  { value: "light" as const, label: "روشن" },
  { value: "dark" as const, label: "تاریک" },
  { value: "system" as const, label: "سیستم" },
];

async function redeemCode() {
  try {
    const { data } = await apiClient.post("/api/promo/redeem", { code: promoCode.value });
    promoMessage.value = `${data.coinsAdded} سکه اضافه شد. موجودی جدید: ${data.newBalance}`;
  } catch (err) {
    promoMessage.value = err instanceof Error ? err.message : "خطا در فعال‌سازی کد";
  }
}
</script>
