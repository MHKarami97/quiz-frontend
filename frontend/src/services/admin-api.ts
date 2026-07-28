import { apiClient } from "./api-client";

export interface AdminCategory { id: string; name: string; icon: string; questionCount: number; }
export interface AdminQuestionOption { id: string; text: string; }
export interface AdminQuestion {
  id: string;
  categoryId: string;
  text: string;
  options: AdminQuestionOption[];
  correctOptionId: string;
  difficulty: "easy" | "medium" | "hard";
}
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: "player" | "admin";
  coins: number;
}
export interface AdminPromoCode {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  useCount: number;
  isActive: boolean;
  createdAt: string;
}
export interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalCategories: number;
  totalGameSessions: number;
}
export interface PaginatedResult<T> { items: T[]; total: number; page: number; pageSize: number; }

export const adminApi = {
  getDashboardStats: () => apiClient.get<DashboardStats>("/api/admin/dashboard/stats"),

  listCategories: () => apiClient.get<AdminCategory[]>("/api/admin/categories"),
  createCategory: (name: string, icon: string) => apiClient.post("/api/admin/categories", { name, icon }),
  updateCategory: (id: string, name: string, icon: string) =>
    apiClient.put(`/api/admin/categories/${id}`, { name, icon }),
  deleteCategory: (id: string) => apiClient.delete(`/api/admin/categories/${id}`),

  listQuestions: (page: number, search?: string) =>
    apiClient.get<PaginatedResult<AdminQuestion>>(
      `/api/admin/questions?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    ),
  listQuestionsByCategory: (categoryId: string, page: number) =>
    apiClient.get<PaginatedResult<AdminQuestion>>(`/api/admin/questions/by-category/${categoryId}?page=${page}`),
  getQuestion: (id: string) => apiClient.get<AdminQuestion>(`/api/admin/questions/detail/${id}`),
  createQuestion: (payload: Omit<AdminQuestion, "id">) => apiClient.post("/api/admin/questions", payload),
  updateQuestion: (id: string, payload: Omit<AdminQuestion, "id">) =>
    apiClient.put(`/api/admin/questions/${id}`, payload),
  deleteQuestion: (id: string) => apiClient.delete(`/api/admin/questions/${id}`),
  bulkImportQuestions: (questions: Omit<AdminQuestion, "id">[]) =>
    apiClient.post("/api/admin/questions/bulk-import", { questions }),

  listUsers: (page: number, search?: string) =>
    apiClient.get<PaginatedResult<AdminUser>>(
      `/api/admin/users?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    ),
  updateUserRole: (id: string, role: "player" | "admin") =>
    apiClient.put(`/api/admin/users/${id}/role`, { role }),
  updateUserCoins: (id: string, coins: number) => apiClient.put(`/api/admin/users/${id}/coins`, { coins }),

  listPromoCodes: () => apiClient.get<AdminPromoCode[]>("/api/admin/promo-codes"),
  createPromoCode: (code: string, discountPercent: number, maxUses: number) =>
    apiClient.post("/api/admin/promo-codes", { code, discountPercent, maxUses }),
  updatePromoCode: (id: string, discountPercent: number, maxUses: number, isActive: boolean) =>
    apiClient.put(`/api/admin/promo-codes/${id}`, { discountPercent, maxUses, isActive }),
  deletePromoCode: (id: string) => apiClient.delete(`/api/admin/promo-codes/${id}`),
};
