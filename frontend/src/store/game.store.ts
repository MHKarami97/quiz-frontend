import { defineStore } from "pinia";
import { apiClient } from "../services/api-client";

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const useGameStore = defineStore("game", {
  state: () => ({
    categories: [] as Category[],
    myScore: null as { totalPoints: number; rank: number | null } | null,
    needsScoreUpdate: true,
  }),
  actions: {
    async fetchCategories() {
      if (this.categories.length > 0) return;
      try {
        const { data } = await apiClient.get<Category[]>("/api/categories");
        this.categories = data;
      } catch (err) {
        throw err;
      }
    },
    async fetchScore(force = false) {
      if (!this.needsScoreUpdate && !force && this.myScore) return;
      try {
        const { data } = await apiClient.get<{ totalPoints: number; rank: number | null }>("/api/leaderboard/me");
        this.myScore = data;
        this.needsScoreUpdate = false;
      } catch (err) {
        console.error("Failed to load score:", err);
      }
    },
    markGameFinished() {
      this.needsScoreUpdate = true;
    }
  }
});