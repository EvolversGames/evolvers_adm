// src/data/instructors/instructorApi.ts
import { http } from '../../services/http/index';
import type { Instructor, InstructorFormData } from '../../domain/instructors/instructor';

/**
 * Resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API de instructors - chamadas HTTP puras
 */
export const instructorApi = {
  /**
   * GET /api/instructors - Lista todos os instrutores
   */
  async getAll(): Promise<ApiResponse<Instructor[]>> {
    return http.get<ApiResponse<Instructor[]>>('/instructors');
  },

  /**
   * GET /api/instructors/:id - Busca instrutor por ID
   */
  async getById(id: number): Promise<ApiResponse<Instructor>> {
    return http.get<ApiResponse<Instructor>>(`/instructors/${id}`);
  },

  /**
   * POST /api/instructors - Cria novo instrutor
   */
  async create(data: InstructorFormData): Promise<ApiResponse<Instructor>> {
    const payload = {
      name: data.name,
      slug: data.slug,
      bio_short: data.bio_short || null,
      bio_long: data.bio_long || null,
      avatar_url: data.avatar_url || null,
      website_url: data.website_url || null,
      youtube_url: data.youtube_url || null,
      linkedin_url: data.linkedin_url || null,
      twitter_handle: data.twitter_handle || null,
    };

    return http.post<ApiResponse<Instructor>>('/instructors', payload);
  },

  /**
   * PUT /api/instructors/:id - Atualiza instrutor
   */
  async update(id: number, data: InstructorFormData): Promise<ApiResponse<Instructor>> {
    const payload = {
      name: data.name,
      slug: data.slug,
      bio_short: data.bio_short || null,
      bio_long: data.bio_long || null,
      avatar_url: data.avatar_url || null,
      website_url: data.website_url || null,
      youtube_url: data.youtube_url || null,
      linkedin_url: data.linkedin_url || null,
      twitter_handle: data.twitter_handle || null,
    };

    return http.put<ApiResponse<Instructor>>(`/instructors/${id}`, payload);
  },

  /**
   * DELETE /api/instructors/:id - Deleta instrutor
   */
 // src/data/instructors/instructorApi.ts

async delete(id: number): Promise<ApiResponse<{ message: string; id: number }>> {
  try {
    console.log('🔥 API: Deletando ID', id); // ← ADICIONE
    const response = await http.delete<ApiResponse<{ message: string; id: number }>>(`/instructors/${id}`);
    console.log('✅ API: Deletado com sucesso', response); // ← ADICIONE
    return response;
  } catch (error: any) {
    console.error('❌ API: Erro ao deletar:', error); // ← ADICIONE
    console.error('❌ Detalhes:', error?.body, error?.status); // ← ADICIONE
    
    // Extrai a mensagem de erro do backend
    const errorMessage = error?.body?.error || error?.message || 'Erro ao deletar instrutor';
    throw new Error(errorMessage);
  }
}
};