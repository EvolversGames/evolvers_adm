
// src/domain/levels/level.ts

export interface Level {
  id: number;
  name: string;
  slug: string | null;
  color: string | null;
  sort_order: number;
}

export interface LevelFormData {
  name: string;
  slug: string;
  color: string;
}

export const createEmptyLevel = (): LevelFormData => ({
  name: '',
  slug: '',
  color: '#6366f1',
});

export const levelToFormData = (level: Level): LevelFormData => ({
  name: level.name,
  slug: level.slug || '',
  color: level.color || '#6366f1',
});