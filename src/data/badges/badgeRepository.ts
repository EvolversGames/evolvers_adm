// src/data/badges/badgeRepository.ts
import { badgeApi } from './badge.api';
import type { Badge, BadgeFormData } from '../../domain/badges/badge';

/**
 * Repository de badges - orquestra chamadas à API
 * Não contém fetch direto, apenas usa badgeApi
 */
export const badgeRepository = {
  /**
   * Lista todos os badges
   */
  async getAll(): Promise<Badge[]> {
    const response = await badgeApi.getAll();
    return response.data;
  },

  /**
   * Busca badge por ID
   */
  async getById(id: number): Promise<Badge> {
    const response = await badgeApi.getById(id);
    return response.data;
  },

  /**
   * Cria novo badge
   */
  async create(data: BadgeFormData): Promise<Badge> {
    const response = await badgeApi.create(data);
    return response.data;
  },

  /**
   * Atualiza badge existente
   */
  async update(id: number, data: BadgeFormData): Promise<Badge> {
    const response = await badgeApi.update(id, data);
    return response.data;
  },

  /**
   * Deleta badge
   */
  async delete(id: number): Promise<void> {
    await badgeApi.delete(id);
  },
};
