// src/data/assets/repository.ts

import type { Asset, AssetDraft } from "../../domain/assets/model";
import { createEmptyAssetDraft, assetToDraft, draftToPayload } from "../../domain/assets";
import { assetApi } from "./api";
import { assetStorage } from "./storage";

export const assetRepository = {
  /**
   * Carrega o draft do localStorage ou cria um novo
   */
  loadDraft(): AssetDraft {
    const saved = assetStorage.load();
    return saved ?? createEmptyAssetDraft();
  },

  /**
   * Salva o draft no localStorage
   */
  saveDraft(draft: AssetDraft): void {
    assetStorage.save(draft);
  },

  /**
   * Limpa o draft do localStorage
   */
  clearDraft(): void {
    assetStorage.clear();
  },

  /**
   * Verifica se há draft salvo
   */
  hasDraft(): boolean {
    return assetStorage.hasDraft();
  },

  /**
   * Lista todos os assets
   */
  async listAssets(): Promise<Asset[]> {
    return await assetApi.list();
  },

  /**
   * Busca um asset por ID
   */
  async getAssetById(id: number): Promise<Asset> {
    return await assetApi.getById(id);
  },

  /**
   * Carrega um asset para edição (converte para Draft)
   */
  async loadAssetForEdit(id: number): Promise<AssetDraft> {
    const asset = await assetApi.getById(id);
    return assetToDraft(asset);
  },

  /**
   * Publica um novo asset (cria)
   */
  async publishDraft(draft: AssetDraft): Promise<Asset> {
    const payload = draftToPayload(draft);
    const result = await assetApi.create(payload);
    assetStorage.clear(); // Limpa draft após sucesso
    return result;
  },

  /**
   * Atualiza um asset existente
   */
  async updateAsset(id: number, draft: AssetDraft): Promise<Asset> {
    const payload = draftToPayload(draft);
    return await assetApi.update(id, payload);
  },

  /**
   * Deleta um asset
   */
  async deleteAsset(id: number): Promise<void> {
    await assetApi.delete(id);
  },

  /**
   * Upload de imagem principal
   */
  async uploadImage(file: File): Promise<string> {
    return await assetApi.uploadAssetImage(file);
  },

  /**
   * Upload de mídia do carrossel
   */
  async uploadCarouselMedia(file: File): Promise<{ url: string; thumbnail_url?: string }> {
    return await assetApi.uploadAssetCarouselMedia(file);
  },

  /**
   * Upload múltiplo de mídias do carrossel
   */
  async uploadMultipleCarouselMedia(files: File[]): Promise<Array<{ url: string; thumbnail_url: string }>> {
    return await assetApi.uploadMultipleCarouselMedia(files);
  },

  /**
   * Upload de arquivo do asset
   */
  async uploadAssetFile(file: File): Promise<{ file_path: string; file_size_mb: number }> {
    return await assetApi.uploadAssetFile(file);
  },
};

export { assetRepository as repository };
