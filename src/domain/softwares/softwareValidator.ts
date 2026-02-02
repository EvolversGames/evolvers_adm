// src/domain/softwares/softwareValidator.ts
import type { SoftwareFormData } from './software';
import { validate, rules, type FieldErrors } from '../validation/validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSoftwareForm(data: SoftwareFormData) {
  return validate<SoftwareFormData>(data, {
    name: [
      rules.required<SoftwareFormData, 'name'>('Nome é obrigatório'),
      rules.minLen<SoftwareFormData, 'name'>(2, 'Nome precisa ter pelo menos 2 caracteres'),
    ],
    slug: [
      rules.required<SoftwareFormData, 'slug'>('Slug é obrigatório'),
      rules.pattern<SoftwareFormData, 'slug'>(SLUG_RE, 'Slug inválido (use letras minúsculas, números e hífen)'),
    ],
    color: [
      rules.required<SoftwareFormData, 'color'>('Cor é obrigatória'),
      rules.hexColor<SoftwareFormData, 'color'>('Cor inválida. Use #RRGGBB'),
    ],
    sort_order: [
      rules.intMin<SoftwareFormData, 'sort_order'>(1, 'Ordem deve ser um número inteiro ≥ 1'),
    ],
  });
}

export type SoftwareFieldErrors = FieldErrors<SoftwareFormData>;
