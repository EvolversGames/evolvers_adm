// src/domain/categories/Category.ts

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  sort_order: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  sort_order: number;
}

export const createEmptyCategory = (): CategoryFormData => ({
  name: '',
  slug: '',
  icon: 'faFolder',
  color: '#6366f1',
  description: '',
  sort_order: 1,
});

export const categoryToFormData = (category: Category): CategoryFormData => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon || 'faFolder',
  color: category.color || '#6366f1',
  description: category.description || '',
  sort_order: category.sort_order,
});