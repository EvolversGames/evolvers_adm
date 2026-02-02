// src/domain/categories/categoryValidator.ts
import type { CategoryFormData } from './category';
import { validate, rules, type FieldErrors } from '../validation/validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateCategoryForm(data: CategoryFormData) {
  return validate<CategoryFormData>(data, {
    name: [
      rules.required<CategoryFormData, 'name'>('Nome é obrigatório'),
      rules.minLen<CategoryFormData, 'name'>(2, 'Nome precisa ter pelo menos 2 caracteres'),
    ],
    slug: [
      rules.required<CategoryFormData, 'slug'>('Slug é obrigatório'),
      rules.pattern<CategoryFormData, 'slug'>(SLUG_RE, 'Slug inválido (use letras minúsculas, números e hífen)'),
    ],
    color: [
      rules.required<CategoryFormData, 'color'>('Cor é obrigatória'),
      rules.hexColor<CategoryFormData, 'color'>('Cor inválida. Use #RRGGBB'),
    ],
    sort_order: [
      rules.intMin<CategoryFormData, 'sort_order'>(1, 'Ordem deve ser um número inteiro ≥ 1'),
    ],
  });
}

export type CategoryFieldErrors = FieldErrors<CategoryFormData>;
