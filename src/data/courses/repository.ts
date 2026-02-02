// src/data/courses/repository.ts
import { storage } from "./storage";
import { api } from "./api";
import { createEmptyDraft, type CourseDraft, type Course } from "../../domain/courses/model";
import { draftToPayload } from "../../domain/courses/mapper";

export const repository = {
  async listCourses(): Promise<Course[]> {
    return await api.list();
  },

  async getCourse(id: number): Promise<any> {
    return await api.getById(id);
  },

  async uploadCourseImage(file: File): Promise<string> {
    return await api.uploadCourseImage(file);
  },

  loadDraft(): CourseDraft {
    return storage.load() ?? createEmptyDraft();
  },

  saveDraft(draft: CourseDraft): void {
    storage.save({ ...draft, updatedAt: new Date().toISOString() });
  },

  clearDraft(): void {
    storage.clear();
  },

  async publishDraft(draft: CourseDraft) {
    const payload = draftToPayload(draft);
    const res = await api.create(payload);
    storage.clear();
    return res;
  },

  // ✅ CORRIGIDO: mapper.toPayload → draftToPayload
  async updateDraft(id: number, draft: CourseDraft) {
    const payload = draftToPayload(draft);
    return await api.update(id, payload);
  },

  async updateCourse(id: number, draft: CourseDraft) {
    const payload = draftToPayload(draft);
    const res = await api.update(id, payload);
    storage.clear();
    return res;
  },

  async deleteCourse(id: number): Promise<void> {
    await api.delete(id);
  },
};