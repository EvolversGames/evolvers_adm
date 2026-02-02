// src/data/auth/authApi.ts
// src/data/auth/authApi.ts
import { http } from "../../services/http";
import type { LoginFormData, AuthResponse, User } from "../../domain/auth/auth";
import type { ApiResponse } from "../../domain/auth/auth";


export const authApi = {
  async login(payload: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    // ✅ http.post já retorna o BODY final
    return await http.post<ApiResponse<AuthResponse>>("/auth/login", payload);
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return await http.post<ApiResponse<{ message: string }>>("/auth/logout", {});
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return await http.get<ApiResponse<User>>("/auth/me");
  },
};




/* export const authApi = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await http.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout', {});
  },

  async getCurrentUser(): Promise<User> {
    const response = await http.get<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  }
};
 */