// src/data/levels/api.ts

import { http } from "../../services/http/index";

export interface Level {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export const levelsApi = {
  /**
   * Lista todos os níveis
   * GET /api/levels
   */
  async list(): Promise<Level[]> {
    const response = await http.get<{ success: boolean; data: Level[] }>("/levels");
    return response.data;
  },

  /**
   * Busca nível por ID
   * GET /api/levels/:id
   */
  async getById(id: number): Promise<Level> {
    const response = await http.get<{ success: boolean; data: Level }>(`/levels/${id}`);
    return response.data;
  },
};