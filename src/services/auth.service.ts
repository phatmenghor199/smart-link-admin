// src/services/auth.ts

import { setCookie } from "cookies-next";
import { User, RegisterCredentials } from "@/models";
import { axiosServer } from "@/utils/axios";
import { storeToken, storeTokenRemember } from "@/utils/local-storage/token";

/**
 * Login user with credentials
 */

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export async function loginUser(credentials: LoginCredentials) {
  try {
    const response = await axiosServer.post("/v1/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });

    const token = response.data.data.accessToken;
    if (credentials.rememberMe) {
      console.log("storeTokenRemember", token);
      storeTokenRemember(token);
    } else {
      storeToken(token);
    }

    console.log("storeTokenRemember", token);

    return { success: true, message: "Login successful" };
  } catch {
    return { success: false, message: "Login failed. Please try again." };
  }
}

/**
 * Register a new user
 */
export async function registerUser(credentials: RegisterCredentials): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, you would call your API here
    // Simple validation
    if (credentials.password !== credentials.confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    // Create a new user
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: credentials.name,
      email: credentials.email,
      role: "user",
      createdAt: new Date().toISOString(),
      status: "active",
    };

    // Set auth cookie
    const token = "mock-jwt-token";
    setCookie("auth-token", token);

    // Store user in localStorage

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}
