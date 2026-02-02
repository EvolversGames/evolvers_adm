// src/data/products/productRepository.ts

import { api } from './products.api';
import type { Product, ProductFilters } from '../../domain/products/products';

class ProductRepository {
  async getAll(): Promise<Product[]> {
    return await api.list();
  }

  async getById(id: number): Promise<Product> {
    return await api.getById(id);
  }

  async getFiltered(filters: ProductFilters): Promise<Product[]> {
    const products = await this.getAll();

    return products.filter((product) => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(searchLower) ||
          product.slug.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro de tipo
      if (filters.type && filters.type !== 'all') {
        if (product.product_type !== filters.type) return false;
      }

      // Filtro de status (active/inactive)
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && !product.active) return false;
        if (filters.status === 'inactive' && product.active) return false;
      }

      // Filtro de destaque
      if (filters.featured !== undefined) {
        if (product.featured !== filters.featured) return false;
      }

      return true;
    });
  }

  async delete(id: number): Promise<void> {
    return await api.delete(id);
  }

  async toggleActive(id: number, active: boolean): Promise<Product> {
    return await api.toggleActive(id, active);
  }

  async toggleFeatured(id: number, featured: boolean): Promise<Product> {
    return await api.toggleFeatured(id, featured);
  }
}

export const productRepository = new ProductRepository();