// src/data/badges/badge_mapper.ts
import type { Badge, BadgeFormData } from './badge';

/**
 * Mapper de badges
 * Transformações entre diferentes representações de dados
 */

/**
 * Transforma Badge do banco para BadgeFormData (para edição)
 */
export function badgeToFormData(badge: Badge): BadgeFormData {
  return {
    name: badge.name,
    bg_color: badge.bg_color,
    text_color: badge.text_color,
  };
}

/**
 * Cria um BadgeFormData vazio (para criação)
 */
export function createEmptyBadge(): BadgeFormData {
  return {
    name: '',
    bg_color: '#000000',
    text_color: '#ffffff',
  };
}
