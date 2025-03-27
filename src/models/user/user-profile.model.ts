// src/models/user/index.ts

export interface Shop {
  id: number;
  name: string;
  location: string;
  user: any;
  createdAt: string;
  updatedAt: string | null;
}

export interface Plan {
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

export interface ActiveSubscription {
  id: number;
  plan: Plan;
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

export interface EnhancedUser {
  id: number;
  username: string;
  userRole: "ADMIN" | "DEVELOPER" | "SHOP_ADMIN" | "USER";
  shop: Shop | null;
  activeSubscription: ActiveSubscription | null;
  hasActiveSubscription: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserPaginationResponse {
  content: EnhancedUser[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
