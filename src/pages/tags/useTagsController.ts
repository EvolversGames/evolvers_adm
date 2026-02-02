// src/pages/tags/useTagsController.ts
import { useState, useEffect } from 'react';
import { tagRepository } from '../../data/tags/tagRepository';
import type { Tag, TagFormData } from '../../domain/tags/tag';
import { validateApiError } from '../../domain/validation/apiErrorValidator';

export const useTagsController = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tagRepository.getAll();
      setTags(data);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (data: TagFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const newTag = await tagRepository.create(data);
      setTags([...tags, newTag]);
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: number, data: TagFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await tagRepository.update(id, data);
      setTags(tags.map((tag) => (tag.id === id ? updated : tag)));
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await tagRepository.delete(id);
      setTags(tags.filter((tag) => tag.id !== id));
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

  useEffect(() => {
    loadTags();
  }, []);

  return {
    tags,
    loading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
  };
};
