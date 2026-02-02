// src/data/courses/api.ts

import type { CoursePayload, CourseResponse } from "../../domain/courses/model";
import { http } from "../../services/http/index";

/**
 * API de cursos
 * Conecta com os endpoints reais do backend
 */
export const api = {
  /**
   * Cria um novo curso
   * POST /api/courses
   */
  create(payload: CoursePayload): Promise<CourseResponse> {
    return http.post<{ success: boolean; data: CourseResponse }>("/courses", payload)
      .then(res => res.data);
  },

  /**
   * Atualiza um curso existente
   * PUT /api/courses/:id
   */
  update(id: number, payload: Partial<CoursePayload>): Promise<CourseResponse> {
    return http.put<{ success: boolean; data: CourseResponse }>(`/courses/${id}`, payload)
      .then(res => res.data);
  },

 /**
   * Deleta um curso
   * DELETE /api/courses/:id
   */
  async delete(id: number): Promise<void> {
    await http.delete<{ success: boolean }>(`/courses/${id}`);
  },
  /**
   * Lista todos os cursos
   * GET /api/courses
   */
  list(): Promise<any[]> {
    return http.get<{ success: boolean; data: any[] }>("/courses")
      .then(res => res.data);
  },

  /**
   * Busca curso por ID
   * GET /api/courses/:id
   */
  getById(id: number): Promise<any> {
    return http.get<{ success: boolean; data: any }>(`/courses/${id}`)
      .then(res => res.data);
  },
};