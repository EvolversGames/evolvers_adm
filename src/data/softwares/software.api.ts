import { http } from '../../services/http/index';
import type { Software, SoftwareFormData } from '../../domain/softwares/software';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const softwareApi = {
  async getAll(): Promise<ApiResponse<Software[]>> {
    return http.get<ApiResponse<Software[]>>('/softwares');
  },

  async getById(id: number): Promise<ApiResponse<Software>> {
    return http.get<ApiResponse<Software>>(`/softwares/${id}`);
  },

  async create(data: SoftwareFormData): Promise<ApiResponse<Software>> {
    const payload = {
      name: data.name,
      slug: data.slug,
      icon: data.icon || null,
      color: data.color || null,
      sort_order: data.sort_order,
    };

    return http.post<ApiResponse<Software>>('/softwares', payload);
  },

  async update(id: number, data: SoftwareFormData): Promise<ApiResponse<Software>> {
    const payload = {
      name: data.name,
      slug: data.slug,
      icon: data.icon || null,
      color: data.color || null,
      sort_order: data.sort_order,
    };

    return http.put<ApiResponse<Software>>(`/softwares/${id}`, payload);
  },

  async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
    return http.delete<ApiResponse<{ message: string; id: number }>>(`/softwares/${id}`);
  },
};
