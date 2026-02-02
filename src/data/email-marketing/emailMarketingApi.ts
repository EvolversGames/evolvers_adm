// src/data/email-marketing/emailMarketingApi.ts

import { http } from '../../services/http';

export interface EmailCampaign {
  id: number;
  subject: string;
  content: string;
  filter_role: string | null;
  filter_verified: boolean | null;
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  created_by: number;
  created_by_name?: string;
  created_at: string;
  completed_at: string | null;
}

export interface CampaignListResponse {
  data: EmailCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCampaignDTO {
  subject: string;
  content: string;
  filter_role?: 'admin' | 'user' | null;
  filter_verified?: boolean | null;
}

export interface CampaignFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export const emailMarketingApi = {
  async findAll(filters?: CampaignFilters): Promise<CampaignListResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/email-marketing/campaigns?${queryString}` : '/email-marketing/campaigns';

    const response: any = await http.get(url);
    return response;
  },

  async findById(id: number): Promise<EmailCampaign> {
    const response: any = await http.get(`/email-marketing/campaigns/${id}`);
    return response?.data ?? response;
  },

  async countRecipients(filters?: { role?: string; verified?: boolean }): Promise<number> {
    const params = new URLSearchParams();

    if (filters?.role) params.append('role', filters.role);
    if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());

    const queryString = params.toString();
    const url = queryString ? `/email-marketing/recipients/count?${queryString}` : '/email-marketing/recipients/count';

    const response: any = await http.get(url);
    return response?.count ?? 0;
  },

  async create(data: CreateCampaignDTO): Promise<EmailCampaign> {
    const response: any = await http.post('/email-marketing/campaigns', data);
    return response?.data ?? response;
  },

  async send(id: number): Promise<{ message: string }> {
    const response: any = await http.post(`/email-marketing/campaigns/${id}/send`, {});
    return response;
  },

  async createAndSend(data: CreateCampaignDTO): Promise<{ campaign: EmailCampaign; message: string }> {
    const response: any = await http.post('/email-marketing/send-now', data);
    return response;
  },

  async delete(id: number): Promise<void> {
    await http.delete(`/email-marketing/campaigns/${id}`);
  },

  async preview(content: string, userName?: string): Promise<string> {
    const response: any = await http.post('/email-marketing/preview', { content, userName });
    return response?.html ?? '';
  },
};
