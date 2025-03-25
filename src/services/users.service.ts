// src/services/users.ts
import { User, UserFormData } from "@/types";

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    avatar: "/avatars/john-doe.png",
    createdAt: "2023-01-15T00:00:00.000Z",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    avatar: "/avatars/jane-smith.png",
    createdAt: "2023-02-20T00:00:00.000Z",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    createdAt: "2023-03-10T00:00:00.000Z",
    status: "inactive",
  },
];

/**
 * Fetch all users
 */
export async function fetchAllUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Return mock data
  return [...mockUsers];
}

/**
 * Fetch user by ID
 */
export async function fetchUserById(userId: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find user from mock data
  const user = mockUsers.find((u) => u.id === userId);
  return user || null;
}

/**
 * Create a new user
 */
export async function createUser(userData: UserFormData): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a new user
  const newUser: User = {
    id: Math.random().toString(36).substring(2, 9),
    name: userData.name,
    email: userData.email,
    role: userData.role,
    createdAt: new Date().toISOString(),
    status: userData.status,
  };

  // In a real app, you would save this to your database
  mockUsers.push(newUser);

  return newUser;
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: string,
  userData: UserFormData
): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Find user index
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  // Update user
  const updatedUser: User = {
    ...mockUsers[userIndex],
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status,
  };

  // Update in mock data
  mockUsers[userIndex] = updatedUser;

  return updatedUser;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Find user index
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  // Remove from mock data
  mockUsers.splice(userIndex, 1);

  return true;
}
