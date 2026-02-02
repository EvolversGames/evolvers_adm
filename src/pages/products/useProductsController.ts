// src/pages/products/useProductsController.ts

import { useState, useEffect, useCallback } from 'react';
import { productRepository } from '../../data/products/productRepository';
import type { Product, ProductFilters } from '../../domain/products/products';

export const useProductsController = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Carregar produtos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productRepository.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (e: any) {
      console.error('Erro ao carregar produtos:', e);
      setError(e?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = async () => {
      try {
        const filtered = await productRepository.getFiltered(filters);
        setFilteredProducts(filtered);
      } catch (e: any) {
        console.error('Erro ao filtrar produtos:', e);
      }
    };

    if (products.length > 0) {
      applyFilters();
    }
  }, [filters, products]);

  // Carregar na montagem
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Deletar produto
  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      await productRepository.delete(id);
      await loadProducts(); // Recarrega lista
      return true;
    } catch (e: any) {
      console.error('Erro ao deletar produto:', e);
      setError(e?.message || 'Erro ao deletar produto');
      return false;
    }
  };

  // Toggle ativo
  const toggleActive = async (id: number, active: boolean): Promise<boolean> => {
    try {
      await productRepository.toggleActive(id, active);
      await loadProducts();
      return true;
    } catch (e: any) {
      console.error('Erro ao alterar status:', e);
      setError(e?.message || 'Erro ao alterar status');
      return false;
    }
  };

  // Toggle destaque
  const toggleFeatured = async (id: number, featured: boolean): Promise<boolean> => {
    try {
      await productRepository.toggleFeatured(id, featured);
      await loadProducts();
      return true;
    } catch (e: any) {
      console.error('Erro ao alterar destaque:', e);
      setError(e?.message || 'Erro ao alterar destaque');
      return false;
    }
  };

  // Atualizar filtros
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    products: filteredProducts,
    loading,
    error,
    filters,
    updateFilters,
    deleteProduct,
    toggleActive,
    toggleFeatured,
    reload: loadProducts,
  };
};