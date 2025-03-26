export interface UserProfileModel {
  id: number;
  username: string;
  userRole: string;
  shop: Shop;
  activeSubscription: ActiveSubscription;
  hasActiveSubscription: boolean;
  createdAt: string;
  updatedAt: any;
}

interface Shop {
  id: number;
  name: string;
  location: string;
  user: any;
  createdAt: string;
  updatedAt: any;
}

interface ActiveSubscription {
  id: number;
  plan: Plan;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  transactionId: string;
  amountPaid: number;
  previousSubscriptionId: any;
  createdAt: string;
  updatedAt: any;
  isActive: boolean;
  daysRemaining: number;
}

interface Plan {
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
