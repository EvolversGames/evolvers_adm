// src/data/assets/storage.ts

import type { AssetDraft } from "../../domain/assets/model";

const STORAGE_KEY = "asset_draft";

export const assetStorage = {
  /**
   * Salva o draft no localStorage
   * Nota: URLs de blob (blob:) não são salvas pois são temporárias e inválidas após reload
   */
  save(draft: AssetDraft): void {
    try {
      // Não salvar URLs de blob - elas são temporárias e não funcionam após reload
      const imageUrl = draft.image_url?.startsWith("blob:") ? "" : draft.image_url;

      const data = {
        ...draft,
        image_url: imageUrl,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log("💾 assetStorage.save - Draft salvo");
    } catch (error) {
      console.error("❌ assetStorage.save - Erro ao salvar:", error);
    }
  },

  /**
   * Carrega o draft do localStorage
   */
  load(): AssetDraft | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log("📂 assetStorage.load - Nenhum draft encontrado");
        return null;
      }
      const draft = JSON.parse(data) as AssetDraft;
      console.log("📂 assetStorage.load - Draft carregado:", draft.title || "(sem título)");
      return draft;
    } catch (error) {
      console.error("❌ assetStorage.load - Erro ao carregar:", error);
      return null;
    }
  },

  /**
   * Limpa o draft do localStorage
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ assetStorage.clear - Draft removido");
    } catch (error) {
      console.error("❌ assetStorage.clear - Erro ao limpar:", error);
    }
  },

  /**
   * Verifica se existe um draft salvo
   */
  hasDraft(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },

  /**
   * Retorna a data da última atualização do draft
   */
  getLastUpdated(): string | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const draft = JSON.parse(data) as AssetDraft;
      return draft.updatedAt || null;
    } catch {
      return null;
    }
  },
};

export { assetStorage as storage };
