import { defineStore } from "pinia";
import { apiClient } from "../services/api-client";

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: "player" | "admin";
  coins: number;
}

function loadPersistedUser(): AuthUser | null {
  const raw = localStorage.getItem("auth-user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("auth-token") as string | null,
    user: loadPersistedUser(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "admin",
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
      localStorage.setItem("auth-user", JSON.stringify(user));
    },
    updateCoins(newBalance: number) {
      if (this.user) {
        this.user.coins = newBalance;
        localStorage.setItem("auth-user", JSON.stringify(this.user));
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("auth-token");
      localStorage.removeItem("auth-user");
    },
  },
});
