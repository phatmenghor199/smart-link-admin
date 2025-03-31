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
import { fetchUserById, updateUser } from "@/services/users.service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserProfileModel } from "@/models/user/user-profile.model";

// Define a separate interface for user update that includes password
interface UserUpdateData {
  username: string;
  userRole: "ADMIN" | "DEVELOPER" | "SHOP_ADMIN" | "USER";
  password?: string;
}

// Form validation schema
const editUserSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  userRole: z.enum(["ADMIN", "DEVELOPER", "SHOP_ADMIN", "USER"], {
    errorMap: () => ({ message: "Please select a valid user role" }),
  }),
  password: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
});

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
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      userRole: "USER",
      password: "",
    },
  });

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

        const fetchedUser = await fetchUserById(userId);
        setUser(fetchedUser);

        // Reset form with fetched user data
        reset({
          username: fetchedUser.username,
          userRole: fetchedUser.userRole,
          password: "", // Always start with empty password field
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
      // Prepare update payload
      const updatePayload: UserUpdateData = {
        username: data.username,
        userRole: data.userRole,
      };

      // Only include password if it's not empty
      if (data.password) {
        updatePayload.password = data.password;
      }

      await updateUser(user.id, updatePayload);

      toast.success("User updated successfully");
      router.push(`/users/${user.id}`);
    } catch (error) {
      console.error("Failed to update user:", error);

      // Try to extract meaningful error message
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
      className="container mx-auto px-4 py-8"
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
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
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
                      icon={Mail}
                    />
                  )}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* User Role Select */}
              <div className="space-y-2">
                <Label htmlFor="userRole" className="flex items-center">
                  <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  User Role
                </Label>
                <Controller
                  name="userRole"
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
                {errors.userRole && (
                  <p className="text-sm text-destructive">
                    {errors.userRole.message}
                  </p>
                )}
              </div>

              {/* Password Input (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Save className="mr-2 h-4 w-4 text-muted-foreground" />
                  New Password (Optional)
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      placeholder="Leave blank to keep current password"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave blank if you do not want to change the password
                </p>
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
