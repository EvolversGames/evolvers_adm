// src/data/tags/tagRepository.ts
import { tagApi } from './tagApi';
import type { Tag, TagFormData } from '../../domain/tags/tag';

/**
 * Repository de tags - orquestra chamadas à API
 * Não contém fetch direto, apenas usa tagApi
 */
export const tagRepository = {
  /**
   * Lista todas as tags
   */
  async getAll(): Promise<Tag[]> {
    const response = await tagApi.getAll();
    return response.data;
  },

  /**
   * Busca tag por ID
   */
  async getById(id: number): Promise<Tag> {
    const response = await tagApi.getById(id);
    return response.data;
  },

  /**
   * Cria nova tag
   */
  async create(data: TagFormData): Promise<Tag> {
    const response = await tagApi.create(data);
    return response.data;
  },

  /**
   * Atualiza tag existente
   */
  async update(id: number, data: TagFormData): Promise<Tag> {
    const response = await tagApi.update(id, data);
    return response.data;
  },

  /**
   * Deleta tag
   */
  async delete(id: number): Promise<void> {
    await tagApi.delete(id);
  },
};
