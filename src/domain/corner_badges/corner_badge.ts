// src/domain/corner_badges/corner_badge.ts

export interface CornerBadge {
  id: number;
  name: string;
  bg_gradient: string;
}

export interface CornerBadgeFormData {
  name: string;
  bg_gradient: string;
}

export const createEmptyCornerBadge = (): CornerBadgeFormData => ({
  name: '',
  bg_gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
});

export const cornerBadgeToFormData = (cornerBadge: CornerBadge): CornerBadgeFormData => ({
  name: cornerBadge.name,
  bg_gradient: cornerBadge.bg_gradient,
});
