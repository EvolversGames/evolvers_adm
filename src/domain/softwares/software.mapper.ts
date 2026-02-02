import type { Software, SoftwareFormData } from '../../domain/softwares/software';

export function softwareToFormData(software: Software): SoftwareFormData {
  return {
    name: software.name,
    slug: software.slug,
    icon: software.icon || 'faCube',
    color: software.color || '#6366f1',
    sort_order: software.sort_order,
  };
}

export function createEmptySoftware(): SoftwareFormData {
  return {
    name: '',
    slug: '',
    icon: 'faCube',
    color: '#6366f1',
    sort_order: 1,
  };
}
