// src/data/instructors/instructorRepository.ts
import { instructorApi } from './Instructor.api';
import type { Instructor, InstructorFormData } from '../../domain/instructors/instructor';

/**
 * Repository de instructors - orquestra chamadas à API
 * Não contém fetch direto, apenas usa instructorApi
 */
export const instructorRepository = {
  /**
   * Lista todos os instrutores
   */
  async getAll(): Promise<Instructor[]> {
    const response = await instructorApi.getAll();
    return response.data;
  },

  /**
   * Busca instrutor por ID
   */
  async getById(id: number): Promise<Instructor> {
    const response = await instructorApi.getById(id);
    return response.data;
  },

  /**
   * Cria novo instrutor
   */
  async create(data: InstructorFormData): Promise<Instructor> {
    const response = await instructorApi.create(data);
    return response.data;
  },

  /**
   * Atualiza instrutor existente
   */
  async update(id: number, data: InstructorFormData): Promise<Instructor> {
    const response = await instructorApi.update(id, data);
    return response.data;
  },

  /**
   * Deleta instrutor
   */
  async delete(id: number): Promise<void> {
    await instructorApi.delete(id);
  },
};