// src/data/articles/repository.ts
import { storage } from "./articles_storage";
import { api } from "./articles_api";
import { createEmptyDraft, type ArticleDraft, type Article } from "../../domain/articles/articles_model";
import { draftToPayload } from "../../domain/articles/articles_mapper";

export const repository = {
  async listArticles(): Promise<Article[]> {
    return await api.list();
  },

  async getArticle(id: number): Promise<any> {
    return await api.getById(id);
  },

  async uploadArticleImage(file: File): Promise<string> {
    return await api.uploadArticleImage(file);
  },

  async uploadSectionImage(file: File): Promise<string> {
    return await api.uploadSectionImage(file);
  },

  loadDraft(): ArticleDraft {
    return storage.load() ?? createEmptyDraft();
  },

  saveDraft(draft: ArticleDraft): void {
    storage.save({ ...draft, updatedAt: new Date().toISOString() });
  },

  clearDraft(): void {
    storage.clear();
  },

  async publishDraft(draft: ArticleDraft) {
    const payload = draftToPayload(draft);
    const res = await api.create(payload);
    storage.clear();
    return res;
  },

  async updateDraft(id: number, draft: ArticleDraft) {
    const payload = draftToPayload(draft);
    return await api.update(id, payload);
  },

  async updateArticle(id: number, draft: ArticleDraft) {
    const payload = draftToPayload(draft);
    const res = await api.update(id, payload);
    storage.clear();
    return res;
  },

  async deleteArticle(id: number): Promise<void> {
    await api.delete(id);
  },
};
