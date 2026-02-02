// src/data/users/usersApi.ts

import { http } from '../../services/http';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const usersApi = {
  async findAll(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response: any = await http.get(url);
    // API retorna { data: [], pagination: {} } diretamente
    return response;
  },

  async findById(id: number): Promise<User> {
    const response: any = await http.get(`/users/${id}`);
    return response?.data ?? response;
  },

  async create(data: CreateUserDTO): Promise<User> {
    const response: any = await http.post('/users', data);
    return response?.data ?? response;
  },

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const response: any = await http.put(`/users/${id}`, data);
    return response?.data ?? response;
  },

  async delete(id: number): Promise<void> {
    await http.delete(`/users/${id}`);
  },

  async changeRole(id: number, role: 'admin' | 'user'): Promise<User> {
    const response: any = await http.patch(`/users/${id}/role`, { role });
    return response?.data ?? response;
  },

  async toggleVerification(id: number): Promise<User> {
    const response: any = await http.patch(`/users/${id}/toggle-verification`, {});
    return response?.data ?? response;
  },
};
