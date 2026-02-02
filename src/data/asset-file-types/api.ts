// src/data/asset-file-types/api.ts

import type { AssetFileType, AssetFileTypePayload } from "../../domain/asset-file-types";
import { http } from "../../services/http/index";

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

export const assetFileTypeApi = {
  /**
   * Lista todos os tipos de arquivo de asset
   */
  async list(): Promise<AssetFileType[]> {
    console.log("📥 assetFileTypeApi.list - Buscando tipos de arquivo...");
    const res = await http.get<ApiEnvelope<AssetFileType[]>>("/asset-file-types");
    console.log("✅ assetFileTypeApi.list -", res.data.length ?? 0, "tipos encontrados");
    return res.data;
  },

  /**
   * Busca um tipo de arquivo por ID
   */
  async getById(id: number): Promise<AssetFileType> {
    console.log("📥 assetFileTypeApi.getById - ID:", id);
    const res = await http.get<ApiEnvelope<AssetFileType>>(`/asset-file-types/${id}`);
    return res.data;
  },

  /**
   * Cria um novo tipo de arquivo
   */
  async create(payload: AssetFileTypePayload): Promise<AssetFileType> {
    console.log("📤 assetFileTypeApi.create - Payload:", payload);
    const res = await http.post<ApiEnvelope<AssetFileType>>("/asset-file-types", payload);
    return res.data;
  },

  /**
   * Atualiza um tipo de arquivo existente
   */
  async update(id: number, payload: Partial<AssetFileTypePayload>): Promise<AssetFileType> {
    console.log("📤 assetFileTypeApi.update - ID:", id, "Payload:", payload);
    const res = await http.put<ApiEnvelope<AssetFileType>>(`/asset-file-types/${id}`, payload);
    return res.data;
  },

  /**
   * Deleta um tipo de arquivo
   */
  async delete(id: number): Promise<void> {
    console.log("🗑️ assetFileTypeApi.delete - ID:", id);
    await http.delete<ApiEnvelope<null>>(`/asset-file-types/${id}`);
  },
};

export { assetFileTypeApi as api };
