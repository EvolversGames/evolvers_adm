// frontend/src/pages/admin/Bundles/useBundlesController.ts

import { useEffect, useMemo, useState } from 'react';
import { bundlesStorage } from '../../data/bundles/bundles';
import type { Bundle, BundlesResponse } from '../../domain/bundles/bundle_types';

type BundleStatusFilter = 'active' | 'inactive' | 'all';

function normalizeBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === '1' || v === 'true';
  }
  return false;
}

function isBundleActive(bundle: any): boolean {
  // MySQL tinyint(1) often arrives as 0/1. Some endpoints might use is_active.
  return normalizeBool((bundle?.is_active ?? bundle?.active) as unknown);
}

export const useBundlesController = () => {
  const [allBundles, setAllBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BundleStatusFilter>('active');

  const counts = useMemo(() => {
    const total = allBundles.length;
    const active = allBundles.filter(isBundleActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [allBundles]);

  const bundles = useMemo(() => {
    if (statusFilter === 'all') return allBundles;
    const shouldBeActive = statusFilter === 'active';
    return allBundles.filter((b: any) => isBundleActive(b) === shouldBeActive);
  }, [allBundles, statusFilter]);

  const loadBundles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Admin: traz todos (ativos e inativos), e o filtro fica no frontend.
      const response: BundlesResponse = await bundlesStorage.loadBundles({
        include_inactive: true,
      });

      setAllBundles(response.bundles);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar bundles');
      console.error('Erro ao carregar bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBundle = async (id: number) => {
    try {
      await bundlesStorage.deleteBundle(id);
      await loadBundles();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar bundle');
      console.error('Erro ao deletar bundle:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  return {
    bundles,
    counts,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    deleteBundle,
    refreshBundles: loadBundles,
  };
};

