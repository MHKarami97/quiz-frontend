<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form @submit.prevent="handleLogin" class="w-full max-w-sm rounded-card bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-8 space-y-4">
      <h1 class="text-2xl font-bold text-center mb-4">ورود به چیستا</h1>
      <input v-model="email" type="email" placeholder="ایمیل" required
        class="w-full rounded-pill px-4 py-3 bg-transparent border border-border-light dark:border-border-dark" />
      <input v-model="password" type="password" placeholder="رمز عبور" required
        class="w-full rounded-pill px-4 py-3 bg-transparent border border-border-light dark:border-border-dark" />
      <p v-if="errorMessage" class="text-red-500 text-sm text-center">{{ errorMessage }}</p>
      <button type="submit" :disabled="isLoading"
        class="w-full rounded-pill py-3 bg-accent-light dark:bg-accent-dark text-white font-bold disabled:opacity-50">
        {{ isLoading ? "در حال ورود..." : "ورود" }}
      </button>
      <router-link to="/register" class="block text-center text-sm text-accent-light dark:text-accent-dark">
        حساب ندارید؟ ثبت‌نام کنید
      </router-link>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth.store";

const router = useRouter();
const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    await authStore.login(email.value, password.value);
    router.push("/home");
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطای ناشناخته";
  } finally {
    isLoading.value = false;
  }
}
</script>
