<template>
  <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-pill bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark flex justify-around py-3 shadow-lg">
    <router-link to="/home" class="text-xl">🏠</router-link>
    <router-link to="/duel-lobby" class="text-xl">⚔️</router-link>
    <router-link to="/leaderboard" class="text-xl">🏆</router-link>
    <router-link to="/settings" class="text-xl">⚙️</router-link>
  </nav>
</template>

<script setup lang="ts"></script>
