// frontend/src/data/bundle/bundles_api.ts

import { http } from '../../services/http/index';
import { appConfig } from '../../config/app.config';
import { authStorage } from '../auth/authStorage';
import type { Bundle, CreateBundleData, UpdateBundleData, BundleFilters, BundlesResponse } from '../../domain/bundles/bundle_types';

const authHeaders = (): HeadersInit => {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API de bundles - chamadas HTTP puras
 */
export const bundlesApi = {
  /**
   * GET /api/bundles - Lista todos os bundles
   */
  async getAll(filters?: BundleFilters): Promise<ApiResponse<BundlesResponse>> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.min_price) params.append('min_price', String(filters.min_price));
    if (filters?.max_price) params.append('max_price', String(filters.max_price));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.include_inactive !== undefined) params.append('include_inactive', String(filters.include_inactive));

    const queryString = params.toString();
    const url = queryString ? `/bundles?${queryString}` : '/bundles';
    
    return http.get<ApiResponse<BundlesResponse>>(url);
  },

  /**
   * GET /api/bundles/:id - Busca bundle por ID
   */
  async getById(id: number): Promise<ApiResponse<Bundle>> {
    return http.get<ApiResponse<Bundle>>(`/bundles/${id}`);
  },

  /**
   * POST /api/bundles - Cria novo bundle
   */
  async create(data: CreateBundleData): Promise<ApiResponse<Bundle>> {
    // Converte is_featured → featured, is_active → active
    // Adiciona sort_order aos items
    const payload = {
      title: data.title,
      subtitle: data.subtitle || null,
      description: data.description || null,
      image: data.image,
      price: data.price,
      original_price: data.original_price,
      category_id: data.category_id,
      featured: data.featured || false,  // ← is_featured → featured
      active: data.active !== undefined ? data.active : true,  // 🔥 ENVIA ACTIVE
      purchase_url: (data.purchase_url?.trim?.() ? data.purchase_url.trim() : null),
      items: (data.items || []).map((item, index) => ({
        product_type: item.product_type,
        product_id: item.product_id,
        sort_order: item.sort_order || index + 1  // ← GARANTE sort_order
      }))
    };

    console.log('📤 CREATE Bundle - Payload:', payload);

    return http.post<ApiResponse<Bundle>>('/bundles', payload);
  },

  /**
   * PUT /api/bundles/:id - Atualiza bundle
   */
  async update(id: number, data: UpdateBundleData): Promise<ApiResponse<Bundle>> {
    const payload: any = {};

    if (data.title !== undefined) payload.title = data.title;
    if (data.subtitle !== undefined) payload.subtitle = data.subtitle || null;
    if (data.description !== undefined) payload.description = data.description || null;
    if (data.image !== undefined) payload.image = data.image;
    if (data.price !== undefined) payload.price = data.price;
    if (data.original_price !== undefined) payload.original_price = data.original_price;
    if (data.category_id !== undefined) payload.category_id = data.category_id;
    
    // Converte is_featured → featured
    if (data.featured !== undefined) payload.featured = data.featured;
    
    // Converte is_active → active (UPDATE aceita)
    if (data.active !== undefined) payload.active = data.active;
    
    // ✅ NOVO: purchase_url
   if (data.purchase_url !== undefined) {
      payload.purchase_url = (data.purchase_url?.trim?.() ? data.purchase_url.trim() : null);
    }
    
    // Items com sort_order
    if (data.items !== undefined) {
      payload.items = data.items.map((item, index) => ({
        product_type: item.product_type,
        product_id: item.product_id,
        sort_order: item.sort_order || index + 1  // ← GARANTE sort_order
      }));
    }

    console.log('📤 UPDATE Bundle - Payload:', payload);

    return http.put<ApiResponse<Bundle>>(`/bundles/${id}`, payload);
  },

  /**
   * DELETE /api/bundles/:id - Deleta bundle
   */
  async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
    return http.delete<ApiResponse<{ message: string; id: number }>>(`/bundles/${id}`);
  },

  /**
   * POST /api/uploads/bundles - Upload de imagem do bundle
   */
  async uploadBundleImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 Enviando imagem do bundle:', file.name, file.size);

    const API_BASE_URL: string = appConfig.api.baseUrl;

    const response = await fetch(`${API_BASE_URL}/uploads/bundles`, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro no upload' }));
      throw new Error(error.message || 'Erro no upload');
    }

    const data = await response.json();
    console.log('✅ Upload concluído:', data);

    // Retorna URL completa
    const FILES_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
    const url = data.data.url;
    
    if (/^https?:\/\//i.test(url)) {
      return url; // já é absoluto
    }
    
    return `${FILES_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  }
};