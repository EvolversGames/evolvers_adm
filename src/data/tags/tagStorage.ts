// src/data/tags/tagStorage.ts
import type { TagFormData } from '../../domain/tags/tag';

/**
 * Chave do localStorage para draft de tag
 */
const KEY = 'tags:draft';

/**
 * Storage para rascunhos de tag (localStorage)
 * Útil se quiser implementar "salvar rascunho" no futuro
 */
export const tagStorage = {
  /**
   * Carrega draft do localStorage
   */
  load(): TagFormData | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Salva draft no localStorage
   */
  save(draft: TagFormData): void {
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  /**
   * Limpa draft do localStorage
   */
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
