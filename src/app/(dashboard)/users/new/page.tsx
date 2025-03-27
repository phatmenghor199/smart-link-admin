"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  ShieldCheck,
  Mail,
  UserIcon,
  KeyRound,
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
import { createUser } from "@/services/users.service";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interface for creating a new user
interface NewUserData {
  username: string;
  userRole: "ADMIN" | "DEVELOPER" | "SHOP_ADMIN" | "USER";
  password: string;
}

// Form validation schema
const newUserSchema = z
  .object({
    username: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),

    userRole: z.enum(["ADMIN", "DEVELOPER", "SHOP_ADMIN", "USER"], {
      errorMap: () => ({ message: "Please select a valid user role" }),
    }),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*()]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type NewUserFormData = z.infer<typeof newUserSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      username: "",
      userRole: "USER",
      password: "",
      confirmPassword: "",
    },
  });

  // Optional: Password strength tracking
  const passwordValue = watch("password");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (passwordValue) {
      // Check length
      strength += passwordValue.length >= 8 ? 1 : 0;

      // Check complexity
      strength += /[A-Z]/.test(passwordValue) ? 1 : 0;
      strength += /[a-z]/.test(passwordValue) ? 1 : 0;
      strength += /[0-9]/.test(passwordValue) ? 1 : 0;
      strength += /[!@#$%^&*()]/.test(passwordValue) ? 1 : 0;
    }
    setPasswordStrength(strength);
  }, [passwordValue]);

  // Form submission handler
  const onSubmit = async (data: NewUserFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Prepare new user data
      const newUserPayload: NewUserData = {
        username: data.username,
        userRole: data.userRole,
        password: data.password,
      };

      const newUser = await createUser(newUserPayload);

      toast.success("User created successfully");
      router.push(`/users/${newUser.id}`);
    } catch (error) {
      console.error("Failed to create user:", error);

      // Try to extract meaningful error message
      const errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setErrorMessage(errorMsg);
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Create User Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Create a new user account with specific details
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

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === 0
                          ? "bg-destructive w-[0%]"
                          : passwordStrength <= 2
                          ? "bg-yellow-500 w-[25%]"
                          : passwordStrength <= 3
                          ? "bg-orange-500 w-[50%]"
                          : passwordStrength === 4
                          ? "bg-green-500 w-[75%]"
                          : "bg-green-600 w-full"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {passwordStrength === 0 && "Very Weak"}
                    {passwordStrength === 1 && "Weak"}
                    {passwordStrength === 2 && "Fair"}
                    {passwordStrength === 3 && "Strong"}
                    {passwordStrength >= 4 && "Very Strong"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters, include uppercase,
                  lowercase, number, and special character
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                  Confirm Password
                </Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
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
            onClick={() => router.push("/users")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
