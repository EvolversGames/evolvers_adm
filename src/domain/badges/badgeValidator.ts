// src/domain/badges/badgeValidator.ts
import type { BadgeFormData } from './badge';
import { validate, rules, type FieldErrors } from '../validation/validator';

export function validateBadgeForm(data: BadgeFormData) {
  return validate<BadgeFormData>(data, {
    name: [
      rules.required<BadgeFormData, 'name'>('Nome é obrigatório'),
      rules.minLen<BadgeFormData, 'name'>(2, 'Nome precisa ter pelo menos 2 caracteres'),
    ],
    bg_color: [
      rules.required<BadgeFormData, 'bg_color'>('Cor de fundo é obrigatória'),
      rules.hexColor<BadgeFormData, 'bg_color'>('Cor inválida. Use #RRGGBB'),
    ],
    text_color: [
      rules.required<BadgeFormData, 'text_color'>('Cor do texto é obrigatória'),
      rules.hexColor<BadgeFormData, 'text_color'>('Cor inválida. Use #RRGGBB'),
    ],
  });
}

export type BadgeFieldErrors = FieldErrors<BadgeFormData>;
