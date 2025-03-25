"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, UserFormData } from "@/types";
import {
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchUserById,
} from "@/services/users.service";
import { UserTable } from "@/components/users/user-table";
import { UserForm } from "@/components/users/user-form";
import { toast } from "sonner";
import Image from "next/image";

export default function UsersPage() {
  // Local state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle view user
  const handleViewUser = async (userId: string) => {
    try {
      const user = await fetchUserById(userId);
      if (user) {
        setSelectedUser(user);
        setIsViewUserOpen(true);
      }
    } catch {
      toast.error("Failed to fetch user details");
    }
  };

  // Handle edit user
  const handleEditUser = async (userId: string) => {
    try {
      const user = await fetchUserById(userId);
      if (user) {
        setSelectedUser(user);
        setIsEditUserOpen(true);
      }
    } catch {
      toast.error("Failed to fetch user details for editing");
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const user = await fetchUserById(userId);
      if (user) {
        setSelectedUser(user);
        setIsDeleteUserOpen(true);
      }
    } catch {
      toast.error("Failed to fetch user details for deletion");
    }
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleteLoading(true);
    try {
      await deleteUser(selectedUser.id);
      // Update local state
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setIsDeleteUserOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Handle create user
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      const newUser = await createUser(userData);
      // Update local state
      setUsers([...users, newUser]);
      setIsAddUserOpen(false);
      toast.success("User created successfully");
    } catch {
      toast.error("Failed to create user");
    }
  };

  // Handle update user
  const handleUpdateUser = async (userData: UserFormData) => {
    if (!selectedUser) return;

    try {
      const updatedUser = await updateUser(selectedUser.id, userData);
      // Update local state
      setUsers(
        users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setIsEditUserOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch {
      toast.error("Failed to update user");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <Button onClick={() => setIsAddUserOpen(true)} className="sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {selectedUser.avatar ? (
                    <Image
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="mt-1">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="mt-1">{selectedUser.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="mt-1">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID</p>
                  <p className="mt-1">{selectedUser.id}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewUserOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={() => setIsAddUserOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setIsEditUserOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Dialog */}
      {selectedUser && (
        <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser.name}? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteUserOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
                disabled={isDeleteLoading}
              >
                {isDeleteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
