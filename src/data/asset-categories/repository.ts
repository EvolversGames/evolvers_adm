// src/data/asset-categories/repository.ts

import type { AssetCategory, AssetCategoryPayload } from "../../domain/asset-categories";
import { assetCategoryApi } from "./api";

export const assetCategoryRepository = {
  /**
   * Lista todas as categorias de asset
   */
  async list(): Promise<AssetCategory[]> {
    return await assetCategoryApi.list();
  },

  /**
   * Busca uma categoria por ID
   */
  async getById(id: number): Promise<AssetCategory> {
    return await assetCategoryApi.getById(id);
  },

  /**
   * Cria uma nova categoria
   */
  async create(payload: AssetCategoryPayload): Promise<AssetCategory> {
    return await assetCategoryApi.create(payload);
  },

  /**
   * Atualiza uma categoria existente
   */
  async update(id: number, payload: Partial<AssetCategoryPayload>): Promise<AssetCategory> {
    return await assetCategoryApi.update(id, payload);
  },

  /**
   * Deleta uma categoria
   */
  async delete(id: number): Promise<void> {
    await assetCategoryApi.delete(id);
  },
};

export { assetCategoryRepository as repository };
