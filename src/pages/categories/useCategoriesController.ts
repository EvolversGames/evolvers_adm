// src/pages/categories/useCategoriesController.ts
import { useState, useEffect } from 'react';
import { categoryRepository } from '../../data/categories/categoryRepository';
import type { Category, CategoryFormData } from '../../domain/categories/category';
import { validateApiError } from '../../domain/validation/apiErrorValidator';

export const useCategoriesController = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryRepository.getAll();
      setCategories(data);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CategoryFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoryRepository.create(data);
      setCategories([...categories, newCategory]);
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: CategoryFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await categoryRepository.update(id, data);
      setCategories(categories.map((cat) => (cat.id === id ? updated : cat)));
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await categoryRepository.delete(id);
      setCategories(categories.filter((cat) => cat.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      
      // Retorna o erro específico para o modal
      return { 
        success: false, 
        error: apiError.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const reorderCategories = async (reordered: Category[]) => {
    const updates = reordered.map((cat, index) => ({
      id: cat.id,
      sort_order: index + 1,
    }));

    try {
      await categoryRepository.reorder(updates);
      setCategories(reordered);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
};