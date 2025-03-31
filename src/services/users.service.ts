// src/services/users.service.ts

import { UserRole, UserStatus } from "@/constants/enum/user-enum";
import { axiosClientWithAuth } from "@/utils/axios";

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

export async function getAllShopAdminService(param: UserFilterOptions) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/user`, param);
    return response.data.data;
  } catch {
    return null;
  }
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

export interface RegisterUserRequest {
  email: string;
  password: string;
  role: string;
  status: string;
}
export async function registerUserApi(userData: RegisterUserRequest) {
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
    // check error DuplicateNameException
    if (error.response?.status === 409) {
      return {
        success: false,
        error: "Email already exists",
      };
    }
    // check error InvalidEmailException
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

export async function fetchUserById({ userId }: { userId: number }) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/user/${userId}`);
    return response.data.data;
  } catch {
    return null;
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
