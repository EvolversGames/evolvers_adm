// src/domain/corner_badges/cornerBadgeValidator.ts
import type { CornerBadgeFormData } from './corner_badge';
import { validate, rules, type FieldErrors } from '../validation/validator';

export function validateCornerBadgeForm(data: CornerBadgeFormData) {
  return validate<CornerBadgeFormData>(data, {
    name: [
      rules.required<CornerBadgeFormData, 'name'>('Nome é obrigatório'),
      rules.minLen<CornerBadgeFormData, 'name'>(2, 'Nome precisa ter pelo menos 2 caracteres'),
    ],
    bg_gradient: [
      rules.required<CornerBadgeFormData, 'bg_gradient'>('Gradiente é obrigatório'),
      rules.custom<CornerBadgeFormData, 'bg_gradient'>(
        (value) => {
          const pattern = /^linear-gradient\([^)]+\)$/i;
          return pattern.test(value);
        },
        'Gradiente inválido. Use formato: linear-gradient(135deg, #color1, #color2)'
      ),
    ],
  });
}

export type CornerBadgeFieldErrors = FieldErrors<CornerBadgeFormData>;
