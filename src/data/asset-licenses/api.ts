// src/data/asset-licenses/api.ts

import type { AssetLicense, AssetLicensePayload } from "../../domain/asset-licenses";
import { http } from "../../services/http/index";

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

export const assetLicenseApi = {
  /**
   * Lista todas as licenças de asset
   */
  async list(): Promise<AssetLicense[]> {
    console.log("📥 assetLicenseApi.list - Buscando licenças...");
    const res = await http.get<ApiEnvelope<AssetLicense[]>>("/asset-licenses");
    console.log("✅ assetLicenseApi.list -", res.data.length ?? 0, "licenças encontradas");
    return res.data;
  },

  /**
   * Busca uma licença por ID
   */
  async getById(id: number): Promise<AssetLicense> {
    console.log("📥 assetLicenseApi.getById - ID:", id);
    const res = await http.get<ApiEnvelope<AssetLicense>>(`/asset-licenses/${id}`);
    return res.data;
  },

  /**
   * Cria uma nova licença
   */
  async create(payload: AssetLicensePayload): Promise<AssetLicense> {
    console.log("📤 assetLicenseApi.create - Payload:", payload);
    const res = await http.post<ApiEnvelope<AssetLicense>>("/asset-licenses", payload);
    return res.data;
  },

  /**
   * Atualiza uma licença existente
   */
  async update(id: number, payload: Partial<AssetLicensePayload>): Promise<AssetLicense> {
    console.log("📤 assetLicenseApi.update - ID:", id, "Payload:", payload);
    const res = await http.put<ApiEnvelope<AssetLicense>>(`/asset-licenses/${id}`, payload);
    return res.data;
  },

  /**
   * Deleta uma licença
   */
  async delete(id: number): Promise<void> {
    console.log("🗑️ assetLicenseApi.delete - ID:", id);
    await http.delete<ApiEnvelope<null>>(`/asset-licenses/${id}`);
  },
};

export { assetLicenseApi as api };
