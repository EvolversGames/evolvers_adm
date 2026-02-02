// src/data/corner_badges/corner_badge_storage.ts
import type { CornerBadgeFormData } from '../../domain/corner_badges/corner_badge';

/**
 * Chave do localStorage para draft de corner badge
 */
const KEY = 'corner_badges:draft';

/**
 * Storage para rascunhos de corner badge (localStorage)
 * Útil se quiser implementar "salvar rascunho" no futuro
 */
export const cornerBadgeStorage = {
  /**
   * Carrega draft do localStorage
   */
  load(): CornerBadgeFormData | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Salva draft no localStorage
   */
  save(draft: CornerBadgeFormData): void {
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  /**
   * Limpa draft do localStorage
   */
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
