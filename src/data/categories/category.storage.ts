// src/data/categories/categoryStorage.ts
import type { CategoryFormData } from '../../domain/categories/category';

/**
 * Chave do localStorage para draft de categoria
 */
const KEY = 'categories:draft';

/**
 * Storage para rascunhos de categoria (localStorage)
 * Útil se quiser implementar "salvar rascunho" no futuro
 */
export const categoryStorage = {
  /**
   * Carrega draft do localStorage
   */
  load(): CategoryFormData | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Salva draft no localStorage
   */
  save(draft: CategoryFormData): void {
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  /**
   * Limpa draft do localStorage
   */
  clear(): void {
    localStorage.removeItem(KEY);
  },
};