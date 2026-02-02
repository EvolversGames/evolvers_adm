// src/data/levels/levelRepository.ts
import type { Level } from '../../domain/levels/level';
import { appConfig } from '../../config/app.config';

const API_BASE_URL = appConfig.api.baseUrl;

export const levelRepository = {
  /**
   * Listar todos os níveis
   */
  async getAll(): Promise<Level[]> {
    const response = await fetch(`${API_BASE_URL}/levels`);
    if (!response.ok) throw new Error('Erro ao buscar níveis');
    const json = await response.json();
    return json.data || json;
  },

  /**
   * Buscar nível por ID
   */
  async getById(id: number): Promise<Level> {
    const response = await fetch(`${API_BASE_URL}/levels/${id}`);
    if (!response.ok) throw new Error('Nível não encontrado');
    const json = await response.json();
    return json.data || json;
  },
};
