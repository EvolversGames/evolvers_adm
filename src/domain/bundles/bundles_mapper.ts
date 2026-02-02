// frontend/src/data/bundle/bundles_mapper.ts

import type { Bundle, BundlesResponse } from '../../domain/bundles/bundle_types';

export const bundlesMapper = {
  // Mapeia a resposta da API para o formato do domínio
  fromApi(apiResponse: any): Bundle {
    return {
      id: apiResponse.id,
      title: apiResponse.title,
      slug: apiResponse.slug,
      subtitle: apiResponse.subtitle || undefined,
      description: apiResponse.description || undefined,
      image: apiResponse.image,
      price: apiResponse.price,
      original_price: apiResponse.original_price,
      discount_percentage: apiResponse.discount_percentage,
      category_id: apiResponse.category_id,
      category_name: apiResponse.category_name ?? apiResponse.category ?? undefined,
      featured: apiResponse.featured ?? false,
      active: apiResponse.active ?? true,
      items: apiResponse.items || [],
         items_count: apiResponse.items_count !== undefined ? Number(apiResponse.items_count) : undefined,
      purchase_url: apiResponse.purchase_url || null,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at
    };
  },

  // Mapeia array de bundles
  fromApiList(apiResponse: any): BundlesResponse {
    return {
      bundles: apiResponse.bundles.map((bundle: any) => this.fromApi(bundle)),
      total: apiResponse.total,
      limit: apiResponse.limit,
      offset: apiResponse.offset
    };
  }
};