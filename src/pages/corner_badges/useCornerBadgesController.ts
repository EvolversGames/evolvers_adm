// src/pages/corner_badges/useCornerBadgesController.ts
import { useState, useEffect } from 'react';
import { cornerBadgeRepository } from '../../data/corner_badges/cornerBadgeRepository';
import type { CornerBadge, CornerBadgeFormData } from '../../domain/corner_badges/corner_badge';
import { validateApiError } from '../../domain/validation/apiErrorValidator';

export const useCornerBadgesController = () => {
  const [cornerBadges, setCornerBadges] = useState<CornerBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCornerBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cornerBadgeRepository.getAll();
      setCornerBadges(data);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createCornerBadge = async (data: CornerBadgeFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const newCornerBadge = await cornerBadgeRepository.create(data);
      setCornerBadges([...cornerBadges, newCornerBadge]);
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCornerBadge = async (id: number, data: CornerBadgeFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await cornerBadgeRepository.update(id, data);
      setCornerBadges(cornerBadges.map((cb) => (cb.id === id ? updated : cb)));
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCornerBadge = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await cornerBadgeRepository.delete(id);
      setCornerBadges(cornerBadges.filter((cb) => cb.id !== id));
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
    loadCornerBadges();
  }, []);

  return {
    cornerBadges,
    loading,
    error,
    loadCornerBadges,
    createCornerBadge,
    updateCornerBadge,
    deleteCornerBadge,
  };
};
