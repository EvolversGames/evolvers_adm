// src/data/dashboard/dashboardApi.ts

import { http } from '../../services/http';

export interface DashboardStats {
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  assets: {
    total: number;
    active: number;
    inactive: number;
  };
  bundles: {
    total: number;
  };
  users: {
    total: number;
    verified: number;
    pending: number;
  };
  downloads: number;
  categories: number;
  instructors: number;
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  email_verified_at: string | null;
}

export interface RecentCourse {
  id: number;
  title: string;
  status: string;
  created_at: string;
  image_url: string | null;
}

export interface RecentAsset {
  id: number;
  title: string;
  active: boolean;
  created_at: string;
  image_url: string | null;
}

export interface RecentDownload {
  id: number;
  downloaded_at: string;
  user_name: string;
  user_email: string;
  asset_title: string;
}

export interface DashboardRecent {
  users: RecentUser[];
  courses: RecentCourse[];
  assets: RecentAsset[];
  downloads: RecentDownload[];
}

export interface ChartDataPoint {
  date?: string;
  category?: string;
  status?: string;
  count: number;
}

export interface DashboardCharts {
  usersPerDay: ChartDataPoint[];
  coursesByCategory: ChartDataPoint[];
  assetsByCategory: ChartDataPoint[];
  downloadsPerDay: ChartDataPoint[];
  coursesStatus: ChartDataPoint[];
}

export interface DashboardData {
  stats: DashboardStats;
  recent: DashboardRecent;
  charts: DashboardCharts;
}

export const dashboardApi = {
  async getAll(): Promise<DashboardData> {
    const response: any = await http.get('/dashboard');
    return response?.data ?? response;
  },

  async getStats(): Promise<DashboardStats> {
    const response: any = await http.get('/dashboard/stats');
    return response?.data ?? response;
  },

  async getRecent(): Promise<DashboardRecent> {
    const response: any = await http.get('/dashboard/recent');
    return response?.data ?? response;
  },

  async getCharts(): Promise<DashboardCharts> {
    const response: any = await http.get('/dashboard/charts');
    return response?.data ?? response;
  },
};
