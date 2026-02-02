// src/data/article-categories/articleCategoryRepository.ts
import { http } from '../../services/http';

export type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  sort_order: number;
};

export const articleCategoryRepository = {
  /**
   * Listar todas as categorias de artigos
   */
  async getAll(): Promise<ArticleCategory[]> {
    const response: any = await http.get('/article-categories');
    return response?.data || response;
  },

  /**
   * Buscar categoria por ID
   */
  async getById(id: number): Promise<ArticleCategory> {
    const response: any = await http.get(`/article-categories/${id}`);
    return response?.data || response;
  },

  /**
   * Criar nova categoria
   */
  async create(data: Omit<ArticleCategory, 'id'>): Promise<ArticleCategory> {
    const response: any = await http.post('/article-categories', data);
    return response?.data || response;
  },

  /**
   * Atualizar categoria
   */
  async update(id: number, data: Partial<ArticleCategory>): Promise<ArticleCategory> {
    const response: any = await http.put(`/article-categories/${id}`, data);
    return response?.data || response;
  },

  /**
   * Remover categoria
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/article-categories/${id}`);
  },
};