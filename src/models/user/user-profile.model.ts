// src/models/user/index.ts

export interface ShopModel {
  id: number;
  name: string;
  location: string;
  user: any;
  createdAt: string;
  updatedAt: string | null;
}

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
  updatedAt: string;
}

export interface ActiveSubscriptionModel {
  id: number;
  plan: PlanModel;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  transactionId: string;
  amountPaid: number;
  previousSubscriptionId: number | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  daysRemaining: number;
}

export interface UserProfileModel {
  id: number;
  username: string;
  userRole: string;
  shop: ShopModel | null;
  status: string;
  activeSubscription: ActiveSubscriptionModel | null;
  hasActiveSubscription: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserProfilePaginationModel {
  content: UserProfileModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
