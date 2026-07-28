import { defineStore } from "pinia";
import { apiClient } from "../services/api-client";

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: "player" | "admin";
  coins: number;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("auth-token") as string | null,
    user: null as AuthUser | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const { data } = await apiClient.post("/api/auth/login", { email, password });
      this.setSession(data.token, data.user);
    },
    async register(email: string, password: string, displayName: string) {
      const { data } = await apiClient.post("/api/auth/register", { email, password, displayName });
      this.setSession(data.token, data.user);
    },
    setSession(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
      localStorage.setItem("auth-token", token);
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("auth-token");
    },
  },
});
