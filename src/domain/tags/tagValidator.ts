// src/domain/tags/tagValidator.ts
import type { TagFormData } from './tag';
import { validate, rules, type FieldErrors } from '../validation/validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateTagForm(data: TagFormData) {
  return validate<TagFormData>(data, {
    name: [
      rules.required<TagFormData, 'name'>('Nome é obrigatório'),
      rules.minLen<TagFormData, 'name'>(2, 'Nome precisa ter pelo menos 2 caracteres'),
    ],
    slug: [
      rules.required<TagFormData, 'slug'>('Slug é obrigatório'),
      rules.pattern<TagFormData, 'slug'>(SLUG_RE, 'Slug inválido (use letras minúsculas, números e hífen)'),
    ],
  });
}

export type TagFieldErrors = FieldErrors<TagFormData>;
