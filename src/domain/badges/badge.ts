// src/domain/badges/badge.ts

export interface Badge {
  id: number;
  name: string;
  bg_color: string;
  text_color: string;
}

export interface BadgeFormData {
  name: string;
  bg_color: string;
  text_color: string;
}

export const createEmptyBadge = (): BadgeFormData => ({
  name: '',
  bg_color: '#000000',
  text_color: '#ffffff',
});

export const badgeToFormData = (badge: Badge): BadgeFormData => ({
  name: badge.name,
  bg_color: badge.bg_color,
  text_color: badge.text_color,
});
