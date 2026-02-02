// frontend/src/data/bundle/bundleRepository.ts

import { bundlesApi } from './bundles_api';
import { bundlesMapper } from '../../domain/bundles/bundles_mapper';
import type { Bundle, CreateBundleData, UpdateBundleData, BundleFilters, BundlesResponse } from '../../domain/bundles/bundle_types';

export const bundleRepository = {
  // Lista todos os bundles
  async getAll(filters?: BundleFilters): Promise<BundlesResponse> {
    const response = await bundlesApi.getAll(filters);
    return bundlesMapper.fromApiList(response.data);
  },

  // Busca bundle por ID
  async getById(id: number): Promise<Bundle> {
    const response = await bundlesApi.getById(id);
    return bundlesMapper.fromApi(response.data);
  },

  // Cria novo bundle
  async create(data: CreateBundleData): Promise<Bundle> {
    const response = await bundlesApi.create(data);
    return bundlesMapper.fromApi(response.data);
  },

  // Atualiza bundle
  async update(id: number, data: UpdateBundleData): Promise<Bundle> {
    const response = await bundlesApi.update(id, data);
    return bundlesMapper.fromApi(response.data);
  },

  // Deleta bundle
  async delete(id: number): Promise<void> {
    await bundlesApi.delete(id);
  }
};