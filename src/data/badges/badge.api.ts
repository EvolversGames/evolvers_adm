// src/data/badges/badge_api.ts
import { http } from '../../services/http/index';
import type { Badge, BadgeFormData } from '../../domain/badges/badge';

/**
 * Resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API de badges - chamadas HTTP puras
 */
export const badgeApi = {
  /**
   * GET /api/badges - Lista todos os badges
   */
  async getAll(): Promise<ApiResponse<Badge[]>> {
    return http.get<ApiResponse<Badge[]>>('/badges');
  },

  /**
   * GET /api/badges/:id - Busca badge por ID
   */
  async getById(id: number): Promise<ApiResponse<Badge>> {
    return http.get<ApiResponse<Badge>>(`/badges/${id}`);
  },

  /**
   * POST /api/badges - Cria novo badge
   */
  async create(data: BadgeFormData): Promise<ApiResponse<Badge>> {
    const payload = {
      name: data.name,
      bg_color: data.bg_color,
      text_color: data.text_color,
    };

    return http.post<ApiResponse<Badge>>('/badges', payload);
  },

  /**
   * PUT /api/badges/:id - Atualiza badge
   */
  async update(id: number, data: BadgeFormData): Promise<ApiResponse<Badge>> {
    const payload = {
      name: data.name,
      bg_color: data.bg_color,
      text_color: data.text_color,
    };

    return http.put<ApiResponse<Badge>>(`/badges/${id}`, payload);
  },

  /**
   * DELETE /api/badges/:id - Deleta badge
   */
  async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
    return http.delete<ApiResponse<{ message: string; id: number }>>(`/badges/${id}`);
  },
};
