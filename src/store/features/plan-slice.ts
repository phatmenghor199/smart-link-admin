import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Plan, PlanState } from "@/types";
import axios from "axios";

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

export const fetchPlans = createAsyncThunk(
  "plans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Return mock data
      return mockPlans;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Failed to fetch plans. Please try again.");
    }
  }
);

export const fetchPlanById = createAsyncThunk(
  "plans/fetchById",
  async (planId: string, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find plan from mock data
      const plan = mockPlans.find((p) => p.id === planId);

      if (!plan) {
        throw new Error("Plan not found");
      }

      return plan;
    } catch {
      return rejectWithValue("Plan not found or failed to fetch plan details.");
    }
  }
);

const initialState: PlanState = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  error: null,
};

const planSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    resetPlanError: (state) => {
      state.error = null;
    },
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all plans
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch plan by ID
    builder
      .addCase(fetchPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPlanError, clearSelectedPlan } = planSlice.actions;
export default planSlice.reducer;
