"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { RootState, AppDispatch } from "@/store";
import { LoginCredentials, RegisterCredentials } from "@/types";
import {
  loginUser,
  logoutUser,
  registerUser,
  resetAuthError,
  setCredentials,
} from "@/store/features/auth-slice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const token = getCookie("auth-token");

    // Check if there's a token but user isn't authenticated yet
    if (token && !isAuthenticated) {
      // In a real app, you would make an API call to validate the token and get user data
      // For now, we'll just simulate this with mock data
      dispatch(
        setCredentials({
          user: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            avatar: "/avatars/john-doe.png",
            createdAt: new Date().toISOString(),
            status: "active",
          },
          token: token.toString(),
        })
      );
    }
  }, [dispatch, isAuthenticated]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const resultAction = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(resultAction)) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const resultAction = await dispatch(registerUser(credentials));
      if (registerUser.fulfilled.match(resultAction)) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const clearError = () => {
    dispatch(resetAuthError());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};
