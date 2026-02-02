// src/data/asset-file-types/repository.ts

import type { AssetFileType, AssetFileTypePayload } from "../../domain/asset-file-types";
import { assetFileTypeApi } from "./api";

export const assetFileTypeRepository = {
  /**
   * Lista todos os tipos de arquivo de asset
   */
  async list(): Promise<AssetFileType[]> {
    return await assetFileTypeApi.list();
  },

  /**
   * Busca um tipo de arquivo por ID
   */
  async getById(id: number): Promise<AssetFileType> {
    return await assetFileTypeApi.getById(id);
  },

  /**
   * Cria um novo tipo de arquivo
   */
  async create(payload: AssetFileTypePayload): Promise<AssetFileType> {
    return await assetFileTypeApi.create(payload);
  },

  /**
   * Atualiza um tipo de arquivo existente
   */
  async update(id: number, payload: Partial<AssetFileTypePayload>): Promise<AssetFileType> {
    return await assetFileTypeApi.update(id, payload);
  },

  /**
   * Deleta um tipo de arquivo
   */
  async delete(id: number): Promise<void> {
    await assetFileTypeApi.delete(id);
  },
};

export { assetFileTypeRepository as repository };
