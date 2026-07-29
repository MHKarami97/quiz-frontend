<template>
  <div class="min-h-screen p-6 max-w-lg mx-auto pb-24">
    <h1 class="text-2xl font-bold mb-6">تنظیمات</h1>

    <!-- Profile section -->
    <section class="mb-6 rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4">
      <h2 class="font-semibold mb-3">اطلاعات کاربری</h2>
      <p class="text-sm text-gray-500 mb-1">ایمیل: {{ authStore.user?.email }}</p>
      <div class="flex gap-2 mt-3">
        <input
          v-model="displayName"
          placeholder="نام نمایشی"
          class="flex-1 rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark"
        />
        <button
          class="rounded-pill px-4 py-2 bg-accent-light dark:bg-accent-dark text-white font-bold"
          :disabled="isSavingName"
          @click="updateDisplayName"
        >
          {{ isSavingName ? "..." : "ذخیره" }}
        </button>
      </div>
      <p v-if="nameMessage" class="mt-2 text-sm" :class="nameError ? 'text-red-500' : 'text-green-600'">
        {{ nameMessage }}
      </p>
    </section>

    <!-- Theme section -->
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

    <!-- Promo code section -->
    <section class="mb-6">
      <h2 class="font-semibold mb-3">فعال‌سازی کد تخفیف</h2>
      <div class="flex gap-2">
        <input
          v-model="promoCode"
          placeholder="کد تخفیف را وارد کنید"
          class="flex-1 rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark"
        />
        <button
          class="rounded-pill px-4 py-2 bg-accent-light dark:bg-accent-dark text-white"
          @click="redeemCode"
        >
          فعال‌سازی
        </button>
      </div>
      <p v-if="promoMessage" class="mt-2 text-sm">{{ promoMessage }}</p>
    </section>

    <!-- Purchase section -->
    <section class="mb-6">
      <h2 class="font-semibold mb-3">خرید سکه</h2>
      <button disabled class="w-full rounded-pill py-3 bg-gray-400 text-white cursor-not-allowed">
        خرید با درگاه (غیرفعال است)
      </button>
      <p class="text-sm text-gray-500 mt-2">
        درگاه پرداخت هنوز فعال نشده است. برای دریافت سکه از کد تخفیف استفاده کنید.
      </p>
    </section>

    <!-- Logout -->
    <section class="mb-6">
      <button
        class="w-full rounded-pill py-3 border-2 border-red-400 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        @click="handleLogout"
      >
        خروج از حساب
      </button>
    </section>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useThemeStore } from "../store/theme.store";
import { useAuthStore } from "../store/auth.store";
import { apiClient } from "../services/api-client";
import BottomNav from "../components/BottomNav.vue";

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();

const promoCode = ref("");
const promoMessage = ref("");
const displayName = ref(authStore.user?.displayName ?? "");
const nameMessage = ref("");
const nameError = ref(false);
const isSavingName = ref(false);

const themeOptions = [
  { value: "light" as const, label: "روشن" },
  { value: "dark" as const, label: "تاریک" },
  { value: "system" as const, label: "سیستم" },
];

async function updateDisplayName() {
  if (!displayName.value.trim()) return;
  isSavingName.value = true;
  nameMessage.value = "";
  nameError.value = false;
  try {
    await apiClient.put("/api/auth/profile", { displayName: displayName.value.trim() });
    if (authStore.user) {
      authStore.user.displayName = displayName.value.trim();
      localStorage.setItem("auth-user", JSON.stringify(authStore.user));
    }
    nameMessage.value = "نام نمایشی با موفقیت ذخیره شد.";
  } catch (err) {
    nameError.value = true;
    nameMessage.value = err instanceof Error ? err.message : "خطا در ذخیره نام";
  } finally {
    isSavingName.value = false;
  }
}

async function redeemCode() {
  try {
    const { data } = await apiClient.post("/api/promo/redeem", { code: promoCode.value });
    promoMessage.value = `${data.coinsAdded} سکه اضافه شد. موجودی جدید: ${data.newBalance}`;
  } catch (err) {
    promoMessage.value = err instanceof Error ? err.message : "خطا در فعال‌سازی کد";
  }
}

function handleLogout() {
  authStore.logout();
  router.push("/");
}
</script>
