// src/data/badges/badge_storage.ts
import type { BadgeFormData } from '../../domain/badges/badge';

/**
 * Chave do localStorage para draft de badge
 */
const KEY = 'badges:draft';

/**
 * Storage para rascunhos de badge (localStorage)
 * Útil se quiser implementar "salvar rascunho" no futuro
 */
export const badgeStorage = {
  /**
   * Carrega draft do localStorage
   */
  load(): BadgeFormData | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Salva draft no localStorage
   */
  save(draft: BadgeFormData): void {
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  /**
   * Limpa draft do localStorage
   */
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
