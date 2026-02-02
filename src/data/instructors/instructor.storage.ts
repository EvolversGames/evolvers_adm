// src/data/instructors/instructorStorage.ts
import type { InstructorFormData } from '../../domain/instructors/instructor';

/**
 * Chave do localStorage para draft de instrutor
 */
const KEY = 'instructors:draft';

/**
 * Storage para rascunhos de instrutor (localStorage)
 * Útil se quiser implementar "salvar rascunho" no futuro
 */
export const instructorStorage = {
  /**
   * Carrega draft do localStorage
   */
  load(): InstructorFormData | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Salva draft no localStorage
   */
  save(draft: InstructorFormData): void {
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  /**
   * Limpa draft do localStorage
   */
  clear(): void {
    localStorage.removeItem(KEY);
  },
};