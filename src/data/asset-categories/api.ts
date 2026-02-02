// src/data/asset-categories/api.ts

import type { AssetCategory, AssetCategoryPayload } from "../../domain/asset-categories";
import { http } from "../../services/http/index";

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

export const assetCategoryApi = {
  /**
   * Lista todas as categorias de asset
   */
  async list(): Promise<AssetCategory[]> {
    console.log("📥 assetCategoryApi.list - Buscando categorias...");
    const res = await http.get<ApiEnvelope<AssetCategory[]>>("/asset-categories");
    console.log("✅ assetCategoryApi.list -", res.data.length ?? 0, "categorias encontradas");
    return res.data;
  },

  /**
   * Busca uma categoria por ID
   */
  async getById(id: number): Promise<AssetCategory> {
    console.log("📥 assetCategoryApi.getById - ID:", id);
    const res = await http.get<ApiEnvelope<AssetCategory>>(`/asset-categories/${id}`);
    return res.data;
  },

  /**
   * Cria uma nova categoria
   */
  async create(payload: AssetCategoryPayload): Promise<AssetCategory> {
    console.log("📤 assetCategoryApi.create - Payload:", payload);
    const res = await http.post<ApiEnvelope<AssetCategory>>("/asset-categories", payload);
    return res.data;
  },

  /**
   * Atualiza uma categoria existente
   */
  async update(id: number, payload: Partial<AssetCategoryPayload>): Promise<AssetCategory> {
    console.log("📤 assetCategoryApi.update - ID:", id, "Payload:", payload);
    const res = await http.put<ApiEnvelope<AssetCategory>>(`/asset-categories/${id}`, payload);
    return res.data;
  },

  /**
   * Deleta uma categoria
   */
  async delete(id: number): Promise<void> {
    console.log("🗑️ assetCategoryApi.delete - ID:", id);
    await http.delete<ApiEnvelope<null>>(`/asset-categories/${id}`);
  },
};

export { assetCategoryApi as api };
