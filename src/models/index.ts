// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  createdAt: string;
  status: "active" | "inactive";
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
  status: "active" | "inactive";
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
}
