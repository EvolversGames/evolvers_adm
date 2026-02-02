// src/pages/softwares/useSoftwaresController.ts
import { useState, useEffect } from 'react';
import { softwareRepository } from '../../data/softwares/softwareRepository';
import type { Software, SoftwareFormData } from '../../domain/softwares/software';
import { validateApiError } from '../../domain/validation/apiErrorValidator';

export const useSoftwaresController = () => {
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSoftwares = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await softwareRepository.getAll();
      setSoftwares(data);
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createSoftware = async (data: SoftwareFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const created = await softwareRepository.create(data);
      setSoftwares([...softwares, created]);
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateSoftware = async (id: number, data: SoftwareFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await softwareRepository.update(id, data);
      setSoftwares(softwares.map((s) => (s.id === id ? updated : s)));
      return true;
    } catch (err: unknown) {
      const apiError = validateApiError(err);
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSoftware = async (id: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      await softwareRepository.delete(id);
      setSoftwares(softwares.filter((s) => s.id !== id));
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
    loadSoftwares();
  }, []);

  return {
    softwares,
    loading,
    error,
    loadSoftwares,
    createSoftware,
    updateSoftware,
    deleteSoftware,
  };
};