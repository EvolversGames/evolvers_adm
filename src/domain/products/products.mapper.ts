// src/domain/products/mapper.ts

import type { Product, ProductListItem } from './products';

export const mapToProductListItem = (product: Product): ProductListItem => {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    image_url: product.image_url,
    product_type: product.product_type,
    price: product.price,
    original_price: product.original_price,
    active: product.active,
    featured: product.featured,
    purchase_url: product.purchase_url,  // ✅ ADICIONAR
    status: product.status,
    created_at: product.created_at,
  };
};

export const calculateDiscount = (price: number, originalPrice: number | null): number => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};