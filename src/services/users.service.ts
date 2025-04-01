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
  } catch (error: any) {
    console.error("Error fetching all users:", error);
    return null;
  }
}

export async function getAllShopAdminService(param: UserFilterOptions) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/user/all`, param);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all shop admins:", error);
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
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
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
    console.error("Registration error:", error);
    if (error.response?.status === 409) {
      return {
        success: false,
        error: "Email already exists",
      };
    }
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed",
    };
  }
}

/**
 * Update user information (username, role, status)
 */
export async function updateUserInfo(
  userId: number,
  userData: {
    username: string;
    role: string;
    status: string;
  }
) {
  try {
    await axiosClientWithAuth.put(`/v1/user/${userId}`, userData);
    return {
      success: true,
      message: "User information updated successfully",
    };
  } catch (error: any) {
    console.error(`Failed to update user with ID ${userId}:`, error);
    if (error.response?.status === 409) {
      return {
        success: false,
        error: "Email already exists",
      };
    }
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update user information",
    };
  }
}

/**
 * Change user password (admin only)
 */
export async function changeUserPasswordByAdmin(changePasswordData: {
  id: number;
  newPassword: string;
  confirmNewPassword: string;
}) {
  try {
    await axiosClientWithAuth.post(
      "/v1/user/change-password-by-admin",
      changePasswordData
    );
    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error: any) {
    console.error("Failed to change user password:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to change password",
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
    console.error("Shop creation error:", error);
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
  } catch (error: any) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

/**
 * Extend an existing subscription
 */
export async function extendSubscription(data: {
  userId: number;
  transactionId: string;
  amountPaid: number;
  notes?: string;
}) {
  try {
    const response = await axiosClientWithAuth.post(
      "/v1/subscriptions/renew",
      data
    );
    return {
      success: true,
      data: response.data.data,
      message: "Subscription extended successfully",
    };
  } catch (error: any) {
    console.error("Error extending subscription:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to extend subscription",
    };
  }
}

/**
 * Change subscription plan
 */
export async function changePlan(data: {
  userId: number;
  newPlanId: number;
  transactionId: string;
  amountPaid: number;
  notes?: string;
}) {
  try {
    const response = await axiosClientWithAuth.post(
      "/v1/subscriptions/change-plan",
      data
    );
    return {
      success: true,
      data: response.data.data,
      message: "Plan changed successfully",
    };
  } catch (error: any) {
    console.error("Error changing plan:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change plan",
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number, reason: string) {
  try {
    const response = await axiosClientWithAuth.post(
      "/v1/subscriptions/cancel",
      null,
      {
        params: {
          userId,
          reason,
        },
      }
    );
    return {
      success: true,
      data: response.data.data,
      message: "Subscription cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to cancel subscription",
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
    role: string;
    status: string;
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
