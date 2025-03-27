// src/services/users.service.ts

import {
  UserProfileModel,
  UserProfilePaginationModel,
  ActiveSubscriptionModel,
} from "@/models/user/user-profile.model";
import { axiosClientWithAuth } from "@/utils/axios";

// Ensure the mock subscription matches the ActiveSubscription interface
const createMockSubscription = (id: number): ActiveSubscriptionModel => ({
  id,
  plan: {
    id: 2,
    name: "Basic Plan",
    description: "Sample subscription",
    durationDays: 30,
    price: 19.99,
    maxProducts: 10,
    allowBanners: true,
    allowPromotions: false,
    allowDelivery: true,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: "",
  },
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: "ACTIVE",
  autoRenew: true,
  transactionId: `TRANS${id}`,
  amountPaid: 19.99,
  previousSubscriptionId: null,
  createdAt: new Date().toISOString(),
  updatedAt: null,
  isActive: true,
  daysRemaining: 30,
});

// Mock static data for users
const mockUsers: UserProfileModel[] = [
  {
    id: 1,
    username: "phatmenghor19@gmail.com",
    userRole: "DEVELOPER",
    shop: null,
    activeSubscription: null,
    hasActiveSubscription: false,
    createdAt: "2025-02-26T19:27:24.033587",
    updatedAt: null,
  },
  {
    id: 2,
    username: "shoptest19@gmail.com",
    userRole: "SHOP_ADMIN",
    shop: {
      id: 1,
      name: "Shop Test",
      location: "Phnom Penh",
      user: null,
      createdAt: "2025-02-26T19:31:15.646054",
      updatedAt: null,
    },
    activeSubscription: createMockSubscription(13),
    hasActiveSubscription: true,
    createdAt: "2025-02-26T19:28:07.757492",
    updatedAt: null,
  },
  {
    id: 3,
    username: "test01@gmail.com",
    userRole: "USER",
    shop: {
      id: 2,
      name: "Test 01",
      location: "Phnom Penh",
      user: null,
      createdAt: "2025-02-26T19:37:51.32159",
      updatedAt: null,
    },
    activeSubscription: null,
    hasActiveSubscription: false,
    createdAt: "2025-02-26T19:37:19.724637",
    updatedAt: "2025-02-26T19:37:51.365725",
  },
  // Additional mock users to demonstrate filtering
  ...Array.from({ length: 7 }, (_, i) => ({
    id: 4 + i,
    username: `user${4 + i}@example.com`,
    userRole: (["ADMIN", "DEVELOPER", "SHOP_ADMIN", "USER"] as const)[i % 4],
    shop: null,
    activeSubscription: i % 3 === 0 ? null : createMockSubscription(100 + i),
    hasActiveSubscription: i % 3 !== 0,
    createdAt: new Date(2025, 2, 26 + i).toISOString(),
    updatedAt: null,
  })),
];

// Interface for filter options
export interface UserFilterOptions {
  search?: string;
  hasActiveSubscription?: boolean;
  role?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export async function getAllUserService(param: UserFilterOptions) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/user`, param);
    return response.data.data;
  } catch {
    return null;
  }
}

/**
 * Fetch a single user by ID with full details
 * @param userId User's unique identifier
 */
export async function fetchUserById(userId: number): Promise<UserProfileModel> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  return user;
}

/**
 * Create a new user
 * @param userData User creation data
 */
export async function createUser(
  userData: Partial<UserProfileModel>
): Promise<UserProfileModel> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate a new unique ID
  const newUser: UserProfileModel = {
    id: mockUsers.length + 1,
    username: userData.username || `user${mockUsers.length + 1}@example.com`,
    userRole: userData.userRole || "USER",
    shop: null,
    activeSubscription: null,
    hasActiveSubscription: false,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  // Add to mock users
  mockUsers.push(newUser);

  return newUser;
}

/**
 * Update an existing user
 * @param userId User's unique identifier
 * @param userData Updated user data
 */
export async function updateUser(
  userId: number,
  userData: Partial<UserProfileModel>
): Promise<UserProfileModel> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find user index
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Update user
  const updatedUser: UserProfileModel = {
    ...mockUsers[userIndex],
    ...userData,
    updatedAt: new Date().toISOString(),
  };

  // Replace in mock users
  mockUsers[userIndex] = updatedUser;

  return updatedUser;
}

/**
 * Delete a user
 * @param userId User's unique identifier
 */
export async function deleteUser(userId: number): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find user index
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Remove from mock users
  mockUsers.splice(userIndex, 1);

  return true;
}

/**
 * Fetch user profile data by token
 */
export async function fetchUserProfileByToken() {
  try {
    const response = await axiosClientWithAuth.get("/v1/user/token");
    return { success: true, data: response.data.data };
  } catch {
    return { success: false, data: null };
  }
}

// Predefined constants
export const USER_ROLES = ["ADMIN", "USER", "SHOP_ADMIN", "DEVELOPER"] as const;

export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

/**
 * Registers a new user
 */
export async function registerUserApi(userData: {
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}) {
  try {
    const response = await axiosClientWithAuth.post(
      "/v1/auth/register",
      userData
    );
    return {
      success: true,
      data: response.data.data,
      message: "User registered successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed",
    };
  }
}

/**
 * Creates a shop for a user
 */
export async function createShopApi(
  userId: number,
  shopData: {
    name: string;
    location: string;
  }
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/shop/${userId}/buy-service`,
      shopData
    );
    return {
      success: true,
      data: response.data.data,
      message: "Shop created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Shop creation failed",
    };
  }
}

/**
 * Creates a subscription for a user
 */
export async function createSubscriptionApi(subscriptionData: {
  userId: number;
  planId: number;
  autoRenew: boolean;
  transactionId: string;
  amountPaid: number;
}) {
  try {
    const response = await axiosClientWithAuth.post(
      "/v1/subscriptions",
      subscriptionData
    );
    return {
      success: true,
      data: response.data.data,
      message: "Subscription created successfully",
    };
  } catch (error: any) {
    console.error("Subscription creation error:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Subscription creation failed",
    };
  }
}

/**
 * Comprehensive user creation process
 */
export async function createUserProcess(userData: {
  user: {
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  };
  shop: {
    name: string;
    location: string;
  };
  subscription: {
    planId: number;
    autoRenew: boolean;
  };
}) {
  try {
    // Step 1: Register User
    const userRegistration = await registerUserApi(userData.user);

    if (!userRegistration.success || !userRegistration.data?.id) {
      throw new Error(userRegistration.error || "User registration failed");
    }

    const userId = userRegistration.data.id;

    // Step 2: Create Shop
    const shopCreation = await createShopApi(userId, userData.shop);

    if (!shopCreation.success) {
      throw new Error(shopCreation.error || "Shop creation failed");
    }

    // Step 3: Create Subscription
    const subscriptionCreation = await createSubscriptionApi({
      userId,
      ...userData.subscription,
      transactionId: `TRANS-${userId}-${Date.now()}`,
      amountPaid: 0, // Default to 0
    });

    if (!subscriptionCreation.success) {
      throw new Error(
        subscriptionCreation.error || "Subscription creation failed"
      );
    }

    return {
      success: true,
      data: {
        user: { userId: userRegistration.data.id },
        shop: { shopId: shopCreation.data.id },
        subscription: { subscriptionId: subscriptionCreation.data.id },
      },
    };
  } catch (error: any) {
    console.error("User creation process failed:", error);
    return {
      success: false,
      error: error.message || "Failed to create user",
    };
  }
}

/**
 * Fetch available plans for subscription
 */
export async function fetchAvailablePlansApi() {
  try {
    const response = await axiosClientWithAuth.get("/v1/plans");
    return {
      success: true,
      plans: response.data.data,
    };
  } catch (error: any) {
    console.error("Failed to fetch plans:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch plans",
    };
  }
}
