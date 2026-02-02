// frontend/src/data/bundle/bundles.ts

import { bundleRepository } from './bundleRepository';
import type { Bundle, CreateBundleData, UpdateBundleData, BundleFilters, BundlesResponse } from '../../domain/bundles/bundle_types';

// frontend/src/data/bundle/bundles.ts

export const bundlesStorage = {
  // Lista todos os bundles
  async loadBundles(filters?: BundleFilters): Promise<BundlesResponse> {
    return await bundleRepository.getAll(filters);
  },

  // Busca bundle por ID
  async loadBundleById(id: number): Promise<Bundle> {
    return await bundleRepository.getById(id);
  },

  // Cria novo bundle
  async createBundle(data: CreateBundleData): Promise<Bundle> {
    return await bundleRepository.create(data);
  },

  // Atualiza bundle
  async updateBundle(id: number, data: UpdateBundleData): Promise<Bundle> {
    return await bundleRepository.update(id, data);
  },

  // Deleta bundle
  async deleteBundle(id: number): Promise<void> {
    await bundleRepository.delete(id);
  }
};