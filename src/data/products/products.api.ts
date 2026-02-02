// src/data/products/api.ts

import { http } from '../../services/http/index';
import type { Product } from '../../domain/products/products';

type ApiEnvelope<T> = { success: boolean; data: T; error?: string };

export const api = {
  async list(): Promise<Product[]> {
    const res = await http.get<ApiEnvelope<Product[]>>('/products');
    return res.data;
  },

  async getById(id: number): Promise<Product> {
    const res = await http.get<ApiEnvelope<Product>>(`/products/${id}`);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await http.delete<ApiEnvelope<null>>(`/products/${id}`);
  },

  async toggleActive(id: number, active: boolean): Promise<Product> {
    const res = await http.patch<ApiEnvelope<Product>>(`/products/${id}`, { active });
    return res.data;
  },

  async toggleFeatured(id: number, featured: boolean): Promise<Product> {
    const res = await http.patch<ApiEnvelope<Product>>(`/products/${id}`, { featured });
    return res.data;
  },
};