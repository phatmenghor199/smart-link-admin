// src/services/auth.ts
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { User, RegisterCredentials } from "@/types";
import { axiosServer } from "@/utils/axios";

// Mock user data
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "admin",
  avatar: "/avatars/john-doe.png",
  createdAt: new Date().toISOString(),
  status: "active",
};

/**
 * Login user with credentials
 */

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export async function loginUser(credentials: LoginCredentials): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await axiosServer.post("/api/v1/auth/login", credentials);

    console.log("##response", response);

    // Set auth cookie
    const token = "mock-jwt-token";
    if (credentials.rememberMe) {
      setCookie("auth-token", token, { maxAge: 30 * 24 * 60 * 60 });
    } else {
      setCookie("auth-token", token);
    }

    // Store user in localStorage for persistence across page refreshes
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(mockUser));
    }

    return { success: true, user: mockUser };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed. Please try again." };
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
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(newUser));
    }

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

/**
 * Logout the current user
 */
export function logoutUser(): void {
  // Delete auth cookie
  deleteCookie("auth-token");

  // Remove user from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie("auth-token");
  return !!token;
}

/**
 * Get the current user
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
    return null;
  }
}
