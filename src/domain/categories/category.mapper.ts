// src/data/categories/categoryMapper.ts
import type { Category, CategoryFormData } from '../../domain/categories/category';

/**
 * Mapper de categorias
 * Transformações entre diferentes representações de dados
 */

/**
 * Transforma Category do banco para CategoryFormData (para edição)
 */
export function categoryToFormData(category: Category): CategoryFormData {
  return {
    name: category.name,
    slug: category.slug,
    icon: category.icon || 'faFolder',
    color: category.color || '#6366f1',
    description: category.description || '',
    sort_order: category.sort_order,
  };
}

/**
 * Cria um CategoryFormData vazio (para criação)
 */
export function createEmptyCategory(): CategoryFormData {
  return {
    name: '',
    slug: '',
    icon: 'faFolder',
    color: '#6366f1',
    description: '',
    sort_order: 1,
  };
}