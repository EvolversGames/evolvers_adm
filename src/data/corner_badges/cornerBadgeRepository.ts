// src/data/corner_badges/cornerBadgeRepository.ts
import { cornerBadgeApi } from './corner_badge_api';
import type { CornerBadge, CornerBadgeFormData } from '../../domain/corner_badges/corner_badge';

/**
 * Repository de corner badges - orquestra chamadas à API
 * Não contém fetch direto, apenas usa cornerBadgeApi
 */
export const cornerBadgeRepository = {
  /**
   * Lista todos os corner badges
   */
  async getAll(): Promise<CornerBadge[]> {
    const response = await cornerBadgeApi.getAll();
    return response.data;
  },

  /**
   * Busca corner badge por ID
   */
  async getById(id: number): Promise<CornerBadge> {
    const response = await cornerBadgeApi.getById(id);
    return response.data;
  },

  /**
   * Cria novo corner badge
   */
  async create(data: CornerBadgeFormData): Promise<CornerBadge> {
    const response = await cornerBadgeApi.create(data);
    return response.data;
  },

  /**
   * Atualiza corner badge existente
   */
  async update(id: number, data: CornerBadgeFormData): Promise<CornerBadge> {
    const response = await cornerBadgeApi.update(id, data);
    return response.data;
  },

  /**
   * Deleta corner badge
   */
  async delete(id: number): Promise<void> {
    await cornerBadgeApi.delete(id);
  },
};
