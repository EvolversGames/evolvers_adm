// src/data/categories/categoryRepository.ts
import { categoryApi } from './category.api';
import type { Category, CategoryFormData } from '../../domain/categories/category';

/**
 * Repository de categorias - orquestra chamadas à API
 * Não contém fetch direto, apenas usa categoryApi
 */
export const categoryRepository = {
  /**
   * Lista todas as categorias
   */
  async getAll(): Promise<Category[]> {
    const response = await categoryApi.getAll();
    return response.data;
  },

  /**
   * Busca categoria por ID
   */
  async getById(id: number): Promise<Category> {
    const response = await categoryApi.getById(id);
    return response.data;
  },

  /**
   * Cria nova categoria
   */
  async create(data: CategoryFormData): Promise<Category> {
    const response = await categoryApi.create(data);
    return response.data;
  },

  /**
   * Atualiza categoria existente
   */
  async update(id: number, data: CategoryFormData): Promise<Category> {
    const response = await categoryApi.update(id, data);
    return response.data;
  },

  /**
   * Deleta categoria
   */
  async delete(id: number): Promise<void> {
    await categoryApi.delete(id);
  },

  /**
   * Reordena categorias
   */
  async reorder(categories: { id: number; sort_order: number }[]): Promise<void> {
    await categoryApi.reorder(categories);
  },
};