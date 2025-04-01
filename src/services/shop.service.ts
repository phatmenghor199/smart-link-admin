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
    await axiosClientWithAuth.put(`/api/v1/shop/${shopId}`, shopData);
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
