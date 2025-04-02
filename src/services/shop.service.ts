import { axiosClientWithAuth } from "@/utils/axios";

/**
 * Update shop information
 */
export async function updateShopInfoService(
  shopId: number,
  shopData: {
    name: string;
    location: string;
  }
) {
  try {
    await axiosClientWithAuth.put(`/v1/shop/${shopId}`, shopData);
    return {
      success: true,
      message: "Shop information updated successfully",
    };
  } catch (error: any) {
    console.error(`Failed to update shop with ID ${shopId}:`, error);
    if (error.response?.status === 409) {
      return {
        success: false,
        error: "Shop name already exists",
      };
    }
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update shop information",
    };
  }
}

/**
 * Update subscription settings
 */
export async function updateSubscriptionService(data: {
  userId: number;
  transactionId: string;
  autoRenew: boolean;
  amountPaid: number;
}) {
  try {
    const response = await axiosClientWithAuth.put(
      "/v1/subscriptions/update",
      data
    );
    return {
      success: true,
      data: response.data.data,
      message: "Subscription updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update subscription",
    };
  }
}
