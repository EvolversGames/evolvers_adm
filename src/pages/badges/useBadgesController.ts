// src/pages/badges/useBadgesController.ts
import { useState, useEffect } from 'react';
import { badgeRepository } from '../../data/badges/badgeRepository';
import type { Badge, BadgeFormData } from '../../domain/badges/badge';
import { validateApiError } from '../../domain/validation/apiErrorValidator';

export const useBadgesController = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await badgeRepository.getAll();
      setBadges(data);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createBadge = async (data: BadgeFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const newBadge = await badgeRepository.create(data);
      setBadges([...badges, newBadge]);
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBadge = async (id: number, data: BadgeFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await badgeRepository.update(id, data);
      setBadges(badges.map((badge) => (badge.id === id ? updated : badge)));
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBadge = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await badgeRepository.delete(id);
      setBadges(badges.filter((badge) => badge.id !== id));
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
    loadBadges();
  }, []);

  return {
    badges,
    loading,
    error,
    loadBadges,
    createBadge,
    updateBadge,
    deleteBadge,
  };
};
