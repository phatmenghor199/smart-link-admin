// src/services/plans.ts
import { Plan } from "@/types";

// Mock data
const mockPlans: Plan[] = [
  {
    id: "1",
    name: "Basic",
    description: "Perfect for getting started",
    price: 9.99,
    features: ["1 User", "5GB Storage", "Basic Support", "Email Notifications"],
    popular: false,
  },
  {
    id: "2",
    name: "Pro",
    description: "Best for professionals",
    price: 19.99,
    features: [
      "5 Users",
      "20GB Storage",
      "Priority Support",
      "Advanced Analytics",
      "API Access",
    ],
    popular: true,
  },
  {
    id: "3",
    name: "Enterprise",
    description: "For large organizations",
    price: 49.99,
    features: [
      "Unlimited Users",
      "100GB Storage",
      "Dedicated Support",
      "Advanced Analytics",
      "API Access",
      "Custom Integrations",
    ],
    popular: false,
  },
];

/**
 * Fetch all plans
 */
export async function fetchAllPlans(): Promise<Plan[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Return mock data
  return [...mockPlans];
}

/**
 * Fetch plan by ID
 */
export async function fetchPlanById(planId: string): Promise<Plan | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find plan from mock data
  const plan = mockPlans.find((p) => p.id === planId);
  return plan || null;
}

/**
 * Subscribe to a plan
 * This is a placeholder for a real subscription function
 */
export async function subscribeToPlan(
  planId: string,
  paymentDetails: any
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // In a real app, you would process the payment and create a subscription
  return {
    success: true,
    message: "Subscription created successfully",
  };
}
