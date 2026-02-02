// src/pages/instructors/useInstructorsController.ts

import { useState, useEffect } from 'react';
import { instructorRepository } from '../../data/instructors/instructorRepository';
import type { Instructor, InstructorFormData } from '../../domain/instructors/instructor';
import { validateApiError } from '../../domain/validation/apiErrorValidator';

// ✅ CERTIFIQUE-SE QUE TEM O "export" NA FRENTE
export const useInstructorsController = () => {
//↑ ESTE "export" É OBRIGATÓRIO!

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstructors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instructorRepository.getAll();
      setInstructors(data);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createInstructor = async (data: InstructorFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const newInstructor = await instructorRepository.create(data);
      setInstructors([...instructors, newInstructor]);
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateInstructor = async (id: number, data: InstructorFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await instructorRepository.update(id, data);
      setInstructors(instructors.map((instructor) => (instructor.id === id ? updated : instructor)));
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteInstructor = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await instructorRepository.delete(id);
      setInstructors(instructors.filter((instructor) => instructor.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return { success: false, error: apiError.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  return {
    instructors,
    loading,
    error,
    loadInstructors,
    createInstructor,
    updateInstructor,
    deleteInstructor,
  };
};