// src/models/plan/plan-model.ts

export interface PlanModel {
  id: number;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  maxProducts: number;
  allowBanners: boolean;
  allowPromotions: boolean;
  allowDelivery: boolean;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PlanPaginationModel {
  content: PlanModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreatePlanData {
  name: string;
  description: string;
  durationDays: number;
  price: number;
  maxProducts: number;
  allowBanners: boolean;
  allowPromotions: boolean;
  allowDelivery: boolean;
}

export interface PlanFilterOptions {
  search?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}
