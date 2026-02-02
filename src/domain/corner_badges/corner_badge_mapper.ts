// src/data/corner_badges/corner_badge_mapper.ts
import type { CornerBadge, CornerBadgeFormData } from '../../domain/corner_badges/corner_badge';

/**
 * Mapper de corner badges
 * Transformações entre diferentes representações de dados
 */

/**
 * Transforma CornerBadge do banco para CornerBadgeFormData (para edição)
 */
export function cornerBadgeToFormData(cornerBadge: CornerBadge): CornerBadgeFormData {
  return {
    name: cornerBadge.name,
    bg_gradient: cornerBadge.bg_gradient,
  };
}

/**
 * Cria um CornerBadgeFormData vazio (para criação)
 */
export function createEmptyCornerBadge(): CornerBadgeFormData {
  return {
    name: '',
    bg_gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  };
}
