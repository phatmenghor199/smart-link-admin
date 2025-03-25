import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { setCookie, deleteCookie } from "cookies-next";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";
import axios from "axios";

// In a real application, these would be API calls
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // For now, we'll use static data
      // In a real app, this would be an API call
      // const response = await axios.post('/api/auth/login', credentials);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response
      const user: User = {
        id: "1",
        name: "John Doeee",
        email: credentials.email,
        role: "admin",
        avatar: "/avatars/john-doe.png",
        createdAt: new Date().toISOString(),
        status: "active",
      };

      const token = "mock-jwt-token";

      // Set auth cookie
      if (credentials.rememberMe) {
        setCookie("auth-token", token, { maxAge: 30 * 24 * 60 * 60 });
      } else {
        setCookie("auth-token", token);
      }

      return { user, token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response
      const user: User = {
        id: "1",
        name: credentials.name,
        email: credentials.email,
        role: "user",
        createdAt: new Date().toISOString(),
        status: "active",
      };

      const token = "mock-jwt-token";

      // Set auth cookie
      setCookie("auth-token", token);

      return { user, token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would call the API to invalidate the token
      // await axios.post('/api/auth/logout');

      // Delete auth cookie
      deleteCookie("auth-token");

      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue("Logout failed. Please try again.");
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout cases
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
