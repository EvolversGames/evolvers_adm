// src/data/asset-licenses/repository.ts

import type { AssetLicense, AssetLicensePayload } from "../../domain/asset-licenses";
import { assetLicenseApi } from "./api";

export const assetLicenseRepository = {
  /**
   * Lista todas as licenças de asset
   */
  async list(): Promise<AssetLicense[]> {
    return await assetLicenseApi.list();
  },

  /**
   * Busca uma licença por ID
   */
  async getById(id: number): Promise<AssetLicense> {
    return await assetLicenseApi.getById(id);
  },

  /**
   * Cria uma nova licença
   */
  async create(payload: AssetLicensePayload): Promise<AssetLicense> {
    return await assetLicenseApi.create(payload);
  },

  /**
   * Atualiza uma licença existente
   */
  async update(id: number, payload: Partial<AssetLicensePayload>): Promise<AssetLicense> {
    return await assetLicenseApi.update(id, payload);
  },

  /**
   * Deleta uma licença
   */
  async delete(id: number): Promise<void> {
    await assetLicenseApi.delete(id);
  },
};

export { assetLicenseRepository as repository };
