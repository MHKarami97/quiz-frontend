<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">کاربران</h2>

    <input
      v-model="searchQuery"
      @input="onSearchChanged"
      placeholder="جستجو بر اساس ایمیل یا نام..."
      class="w-full rounded-pill px-4 py-2 bg-transparent border border-border-light dark:border-border-dark mb-4"
    />

    <p v-if="errorMessage" class="text-red-500 mb-4">{{ errorMessage }}</p>
    <div v-if="isLoading" class="text-center text-gray-500">در حال بارگذاری...</div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-right text-gray-500 border-b border-border-light dark:border-border-dark">
              <th class="py-2 px-2">نام</th>
              <th class="py-2 px-2">ایمیل</th>
              <th class="py-2 px-2">نقش</th>
              <th class="py-2 px-2">سکه</th>
              <th class="py-2 px-2">شناسه</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-b border-border-light dark:border-border-dark">
              <td class="py-2 px-2">{{ u.displayName }}</td>
              <td class="py-2 px-2" dir="ltr">{{ u.email }}</td>
              <td class="py-2 px-2">
                <select :value="u.role" @change="handleRoleChange(u, $event)" class="rounded-pill px-2 py-1 bg-transparent border border-border-light dark:border-border-dark">
                  <option value="player">بازیکن</option>
                  <option value="admin">مدیر</option>
                </select>
              </td>
              <td class="py-2 px-2">
                <input
                  type="number"
                  min="0"
                  :value="u.coins"
                  @change="handleCoinsChange(u, $event)"
                  class="w-20 rounded-pill px-2 py-1 bg-transparent border border-border-light dark:border-border-dark"
                />
              </td>
              <td class="py-2 px-2 text-xs text-gray-500">{{ u.id.slice(0, 8) }}...</td>
            </tr>
          </tbody>
        </table>
        <p v-if="users.length === 0" class="text-gray-500 text-center py-8">کاربری یافت نشد.</p>
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
import { adminApi, AdminUser } from "../../services/admin-api";

const users = ref<AdminUser[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const searchQuery = ref("");
const page = ref(1);
const total = ref(0);
const pageSize = 20;

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

async function loadUsers() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const { data } = await adminApi.listUsers(page.value, searchQuery.value || undefined);
    users.value = data.items;
    total.value = data.total;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در بارگذاری کاربران";
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadUsers);

let searchTimeout: ReturnType<typeof setTimeout>;
function onSearchChanged() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadUsers();
  }, 400);
}

function goToPage(p: number) {
  page.value = p;
  loadUsers();
}

async function handleRoleChange(user: AdminUser, event: Event) {
  const role = (event.target as HTMLSelectElement).value as "player" | "admin";
  errorMessage.value = "";
  try {
    await adminApi.updateUserRole(user.id, role);
    user.role = role;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در تغییر نقش";
  }
}

async function handleCoinsChange(user: AdminUser, event: Event) {
  const coins = Number((event.target as HTMLInputElement).value);
  if (isNaN(coins) || coins < 0) return;
  errorMessage.value = "";
  try {
    await adminApi.updateUserCoins(user.id, coins);
    user.coins = coins;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "خطا در تغییر موجودی سکه";
  }
}
</script>