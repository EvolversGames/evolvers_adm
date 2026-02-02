// src/data/categories/categoryApi.ts
import { http } from '../../services/http/index';
import type { Category, CategoryFormData } from '../../domain/categories/category';

/**
 * Resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API de categorias - chamadas HTTP puras
 */
export const categoryApi = {
  /**
   * GET /api/categories - Lista todas as categorias
   */
  async getAll(): Promise<ApiResponse<Category[]>> {
    return http.get<ApiResponse<Category[]>>('/categories');
  },

  /**
   * GET /api/categories/:id - Busca categoria por ID
   */
  async getById(id: number): Promise<ApiResponse<Category>> {
    return http.get<ApiResponse<Category>>(`/categories/${id}`);
  },

  /**
   * POST /api/categories - Cria nova categoria
   */
  async create(data: CategoryFormData): Promise<ApiResponse<Category>> {
    const payload = {
      name: data.name,
      slug: data.slug,
      icon: data.icon || null,
      color: data.color || null,
      description: data.description || null,
      sort_order: data.sort_order,
    };

    return http.post<ApiResponse<Category>>('/categories', payload);
  },

  /**
   * PUT /api/categories/:id - Atualiza categoria
   */
  async update(id: number, data: CategoryFormData): Promise<ApiResponse<Category>> {
    const payload = {
      name: data.name,
      slug: data.slug,
      icon: data.icon || null,
      color: data.color || null,
      description: data.description || null,
      sort_order: data.sort_order,
    };

    return http.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  },

  /**
   * DELETE /api/categories/:id - Deleta categoria
   */
  async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
    return http.delete<ApiResponse<{ message: string; id: number }>>(`/categories/${id}`);
  },

  /**
   * POST /api/categories/reorder - Reordena categorias
   */
  async reorder(categories: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
    return http.post<ApiResponse<void>>('/categories/reorder', { categories });
  },
};