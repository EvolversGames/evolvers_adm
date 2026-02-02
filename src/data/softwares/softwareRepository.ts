import { softwareApi } from './software.api';
import type { Software, SoftwareFormData } from '../../domain/softwares/software';

export const softwareRepository = {
  async getAll(): Promise<Software[]> {
    const response = await softwareApi.getAll();
    return response.data;
  },

  async getById(id: number): Promise<Software> {
    const response = await softwareApi.getById(id);
    return response.data;
  },

  async create(data: SoftwareFormData): Promise<Software> {
    const response = await softwareApi.create(data);
    return response.data;
  },

  async update(id: number, data: SoftwareFormData): Promise<Software> {
    const response = await softwareApi.update(id, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await softwareApi.delete(id);
  },
};
