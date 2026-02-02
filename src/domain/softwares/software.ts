export interface Software {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface SoftwareFormData {
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
}

export const createEmptySoftware = (): SoftwareFormData => ({
  name: '',
  slug: '',
  icon: 'faCube',
  color: '#6366f1',
  sort_order: 1,
});

export const softwareToFormData = (software: Software): SoftwareFormData => ({
  name: software.name,
  slug: software.slug,
  icon: software.icon || 'faCube',
  color: software.color || '#6366f1',
  sort_order: software.sort_order,
});
