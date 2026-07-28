import { useAuthStore } from "../store/auth.store";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://quiz-of-kings-api.YOUR_SUBDOMAIN.workers.dev";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<{ data: T }> {
  const authStore = useAuthStore();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authStore.token) headers["Authorization"] = `Bearer ${authStore.token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "درخواست ناموفق بود");
  }
  return { data };
}

export const apiClient = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
};
