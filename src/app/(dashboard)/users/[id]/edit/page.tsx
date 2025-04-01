"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  ShieldCheck,
  Mail,
  UserIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchUserById,
  updateUserInfo,
  changeUserPasswordByAdmin,
} from "@/services/users.service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserProfileModel } from "@/models/user/user-profile.model";

// Form validation schema
const editUserSchema = z
  .object({
    username: z.string().email("Please enter a valid email address"),
    role: z.enum(["ADMIN", "DEVELOPER", "SHOP_ADMIN", "USER"], {
      errorMap: () => ({ message: "Please select a valid user role" }),
    }),
    status: z.enum(["ACTIVE", "INACTIVE"], {
      errorMap: () => ({ message: "Please select a valid user status" }),
    }),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Skip validation if no new password
      if (!data.newPassword || data.newPassword.length === 0) {
        return true;
      }

      // Validate password length
      if (data.newPassword.length < 6) {
        return false;
      }

      return true;
    },
    {
      message: "Password must be at least 6 characters",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      // Skip validation if no new password
      if (!data.newPassword || data.newPassword.length === 0) {
        return true;
      }

      // Validate that passwords match
      return data.newPassword === data.confirmNewPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    }
  );

type EditUserFormData = z.infer<typeof editUserSchema>;

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfileModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      role: "USER" as const,
      status: "ACTIVE" as const,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Watch password fields to disable the confirm field when password is empty
  const newPassword = watch("newPassword");

  // Load user details
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        // Convert string ID to number
        const userId = Number(params.id);

        if (isNaN(userId)) {
          toast.error("Invalid user ID");
          router.push("/users");
          return;
        }

        const fetchedUser = await fetchUserById({ userId });
        setUser(fetchedUser);

        // Reset form with fetched user data
        reset({
          username: fetchedUser.username,
          role: fetchedUser.userRole,
          status: fetchedUser.status || "ACTIVE",
          newPassword: "",
          confirmNewPassword: "",
        });
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.error("Failed to load user details");
        router.push("/users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserDetails();
  }, [params.id, router, reset]);

  // Form submission handler
  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // First API call: Update user info
      const userInfoResult = await updateUserInfo(user.id, {
        username: data.username,
        role: data.role,
        status: data.status,
      });

      if (!userInfoResult.success) {
        throw new Error(
          userInfoResult.error || "Failed to update user information"
        );
      }

      // Second API call: Change password (only if password field is not empty)
      if (data.newPassword && data.newPassword.length > 0) {
        const passwordChangeResult = await changeUserPasswordByAdmin({
          id: user.id,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword || data.newPassword,
        });

        if (!passwordChangeResult.success) {
          throw new Error(
            passwordChangeResult.error || "Failed to update password"
          );
        }
      }

      toast.success("User updated successfully");
      router.push(`/users/${user.id}`);
    } catch (error) {
      console.error("Failed to update user:", error);

      const errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setErrorMessage(errorMsg);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure user exists
  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 pb-8"
    >
      {/* Page Header */}
      <div className="flex items-center mb-6 space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/users/${user.id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Update user details and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="user@example.com"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.username && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.username.message?.toString()}
                  </p>
                )}
              </div>

              {/* User Role Select */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center">
                  <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  User Role
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="DEVELOPER">
                          <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            Developer
                          </div>
                        </SelectItem>
                        <SelectItem value="SHOP_ADMIN">
                          <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            Shop Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="USER">
                          <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.role.message?.toString()}
                  </p>
                )}
              </div>

              {/* User Status Select */}
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  User Status
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.status.message?.toString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update user&apos;s password (leave blank to keep current password)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Password Input */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center">
                  <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  New Password
                </Label>
                <Controller
                  name="newPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      placeholder="Leave blank to keep current password"
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                  )}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.newPassword.message?.toString()}
                  </p>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmNewPassword"
                  className="flex items-center"
                >
                  <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  Confirm New Password
                </Label>
                <Controller
                  name="confirmNewPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm new password"
                      disabled={isSubmitting || !newPassword}
                      autoComplete="new-password"
                    />
                  )}
                />
                {errors.confirmNewPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmNewPassword.message?.toString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/users/${user.id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
