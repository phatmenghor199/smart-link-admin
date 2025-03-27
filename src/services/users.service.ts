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
