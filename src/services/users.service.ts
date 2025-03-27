// src/services/users.service.ts

import {
  EnhancedUser,
  UserPaginationResponse,
} from "@/models/user/user-profile.model";
import { axiosClientWithAuth } from "@/utils/axios";

// Mock static data for users
const mockUsers: EnhancedUser[] = [
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
    activeSubscription: {
      id: 13,
      plan: {
        id: 1,
        name: "Basic Plan",
        description: "Entry level plan for new shop owners",
        durationDays: 30,
        price: 29.99,
        maxProducts: 50,
        allowBanners: true,
        allowPromotions: true,
        allowDelivery: true,
        status: "ACTIVE",
        createdAt: "2025-03-24T20:57:11.691786",
        updatedAt: "2025-03-24T20:59:42.226186",
      },
      startDate: "2025-03-25T14:57:54.448879",
      endDate: "2025-04-24T14:57:54.448982",
      status: "ACTIVE",
      autoRenew: true,
      transactionId: "AHAHAH",
      amountPaid: 29.99,
      previousSubscriptionId: null,
      createdAt: "2025-03-25T14:57:54.45424",
      updatedAt: null,
      isActive: true,
      daysRemaining: 29,
    },
    hasActiveSubscription: true,
    createdAt: "2025-02-26T19:28:07.757492",
    updatedAt: null,
  },
  {
    id: 3,
    username: "test01@gmail.com",
    userRole: "SHOP_ADMIN",
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
  // Additional mock users to demonstrate pagination
  ...Array.from({ length: 7 }, (_, i) => ({
    id: 4 + i,
    username: `user${4 + i}@example.com`,
    userRole: ["DEVELOPER", "SHOP_ADMIN", "USER"][i % 3] as
      | "DEVELOPER"
      | "SHOP_ADMIN"
      | "USER",
    shop: null,
    activeSubscription: null,
    hasActiveSubscription: false,
    createdAt: new Date(2025, 2, 26 + i).toISOString(),
    updatedAt: null,
  })),
];

/**
 * Fetch paginated users with optional filters
 * @param page Page number (0-indexed)
 * @param size Number of items per page
 * @param filters Optional filters for user search
 */
export async function fetchPaginatedUsers(
  page = 0,
  size = 10,
  filters: Record<string, any> = {}
): Promise<UserPaginationResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter users based on search query
  const filteredUsers = mockUsers.filter((user) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchTerm) ||
        user.userRole.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  // Paginate results
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    content: paginatedUsers,
    pageNo: page,
    pageSize: size,
    totalElements: filteredUsers.length,
    totalPages: Math.ceil(filteredUsers.length / size),
    last: endIndex >= filteredUsers.length,
  };
}

/**
 * Fetch a single user by ID with full details
 * @param userId User's unique identifier
 */
export async function fetchUserById(userId: number): Promise<EnhancedUser> {
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
  userData: Partial<EnhancedUser>
): Promise<EnhancedUser> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate a new unique ID
  const newUser: EnhancedUser = {
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
  userData: Partial<EnhancedUser>
): Promise<EnhancedUser> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find user index
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Update user
  const updatedUser: EnhancedUser = {
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
