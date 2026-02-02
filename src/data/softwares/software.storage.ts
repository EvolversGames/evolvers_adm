import type { SoftwareFormData } from '../../domain/softwares/software';

const KEY = 'softwares:draft';

export const softwareStorage = {
  load(): SoftwareFormData | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },

  save(draft: SoftwareFormData): void {
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
