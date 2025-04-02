// src/services/plans.service.ts
import {
  CreatePlanData,
  PlanFilterOptions,
  PlanModel,
} from "@/models/setting/plan-model";
import { axiosClientWithAuth } from "@/utils/axios";

/**
 * Fetch all plans with filtering options
 */
export async function fetchAllPlans(param: PlanFilterOptions = {}) {
  try {
    const response = await axiosClientWithAuth.post("/v1/plans/all", param);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return null;
  }
}

/**
 * Fetch plan by ID
 */
export async function fetchPlanById(planId: number): Promise<PlanModel | null> {
  try {
    const response = await axiosClientWithAuth.get(`/v1/plans/${planId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch plan with ID ${planId}:`, error);
    return null;
  }
}

/**
 * Create a new plan
 */
export async function createPlanService(
  planData: CreatePlanData
): Promise<{ success: boolean; data?: PlanModel; error?: string }> {
  try {
    const response = await axiosClientWithAuth.post("/v1/plans", planData);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Failed to create plan:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create plan",
    };
  }
}

/**
 * Update an existing plan
 */
export async function updatePlan(
  planId: number,
  planData: Partial<CreatePlanData>
): Promise<{ success: boolean; data?: PlanModel; error?: string }> {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/plans/${planId}`,
      planData
    );
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error(`Failed to update plan with ID ${planId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update plan",
    };
  }
}

/**
 * Delete a plan
 */
export async function deletePlan(
  planId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await axiosClientWithAuth.delete(`/v1/plans/${planId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete plan with ID ${planId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete plan",
    };
  }
}
