// src/data/tags/tagApi.ts
import { http } from '../../services/http/index';
import type { Tag, TagFormData } from '../../domain/tags/tag';

/**
 * Resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API de tags - chamadas HTTP puras
 */
export const tagApi = {
  /**
   * GET /api/tags - Lista todas as tags
   */
  async getAll(): Promise<ApiResponse<Tag[]>> {
    return http.get<ApiResponse<Tag[]>>('/tags');
  },

  /**
   * GET /api/tags/:id - Busca tag por ID
   */
  async getById(id: number): Promise<ApiResponse<Tag>> {
    return http.get<ApiResponse<Tag>>(`/tags/${id}`);
  },

  /**
   * POST /api/tags - Cria nova tag
   */
  async create(data: TagFormData): Promise<ApiResponse<Tag>> {
    const payload = {
      name: data.name,
      slug: data.slug,
    };

    return http.post<ApiResponse<Tag>>('/tags', payload);
  },

  /**
   * PUT /api/tags/:id - Atualiza tag
   */
  async update(id: number, data: TagFormData): Promise<ApiResponse<Tag>> {
    const payload = {
      name: data.name,
      slug: data.slug,
    };

    return http.put<ApiResponse<Tag>>(`/tags/${id}`, payload);
  },

  /**
   * DELETE /api/tags/:id - Deleta tag
   */
  async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
    try {
      return http.delete<ApiResponse<{ message: string; id: number }>>(`/tags/${id}`);
    } catch (error: any) {
      // Extrai a mensagem de erro do backend
      const errorMessage = error?.body?.error || error?.message || 'Erro ao deletar tag';
      throw new Error(errorMessage);
    }
  },
};
