// src/domain/products/model.ts

export type ProductType = 'course' | 'asset' | 'software' | 'bundle' | 'article';

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  product_type: ProductType;
  price: number;
  original_price: number | null;
  active: boolean;
  featured: boolean;
  purchase_url?: string | null;  // ✅ ADICIONAR - Link externo de compra
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  product_type: ProductType;
  price: number;
  original_price: number | null;
  active: boolean;
  featured: boolean;
  purchase_url?: string | null;  // ✅ ADICIONAR - Link externo de compra
  status: string;
  created_at: string;
}

export interface ProductFilters {
  search?: string;
  type?: ProductType | 'all';
  status?: 'all' | 'active' | 'inactive';
  featured?: boolean;
}