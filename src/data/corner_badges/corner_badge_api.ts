// src/data/corner_badges/corner_badge_api.ts
import { http } from '../../services/http/index';
import type { CornerBadge, CornerBadgeFormData } from '../../domain/corner_badges/corner_badge';

/**
 * Resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API de corner badges - chamadas HTTP puras
 */
export const cornerBadgeApi = {
  /**
   * GET /api/corner-badges - Lista todos os corner badges
   */
  async getAll(): Promise<ApiResponse<CornerBadge[]>> {
    return http.get<ApiResponse<CornerBadge[]>>('/corner-badges');
  },

  /**
   * GET /api/corner-badges/:id - Busca corner badge por ID
   */
  async getById(id: number): Promise<ApiResponse<CornerBadge>> {
    return http.get<ApiResponse<CornerBadge>>(`/corner-badges/${id}`);
  },

  /**
   * POST /api/corner-badges - Cria novo corner badge
   */
  async create(data: CornerBadgeFormData): Promise<ApiResponse<CornerBadge>> {
    const payload = {
      name: data.name,
      bg_gradient: data.bg_gradient,
    };

    return http.post<ApiResponse<CornerBadge>>('/corner-badges', payload);
  },

  /**
   * PUT /api/corner-badges/:id - Atualiza corner badge
   */
  async update(id: number, data: CornerBadgeFormData): Promise<ApiResponse<CornerBadge>> {
    const payload = {
      name: data.name,
      bg_gradient: data.bg_gradient,
    };

    return http.put<ApiResponse<CornerBadge>>(`/corner-badges/${id}`, payload);
  },

  /**
   * DELETE /api/corner-badges/:id - Deleta corner badge
   */
  async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
    return http.delete<ApiResponse<{ message: string; id: number }>>(`/corner-badges/${id}`);
  },
};
