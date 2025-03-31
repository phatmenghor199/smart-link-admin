"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  Mail,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import FormField from "@/components/form/form-field";
import {
  USER_ROLES,
  USER_ROLES_CREATE,
  USER_STATUS,
} from "@/constants/key-page.ts/filter-user";
import { UserRole, UserStatus } from "@/constants/enum/user-enum";
import { registerUserApi, RegisterUserRequest } from "@/services/users.service";

// Create simplified validation schema with proper context typing
const userCreationSchema = z.object({
  // User Details
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),

  // Simple password validation
  password: z.string().min(1, "Password is required"),

  // User Role selection
  role: z.enum(USER_ROLES, {
    errorMap: () => ({
      message: "Please select a valid user role",
    }),
  }),

  // User Status selection
  status: z.enum(USER_STATUS, {
    errorMap: () => ({
      message: "Please select a valid user status",
    }),
  }),
});

type UserCreationFormData = z.infer<typeof userCreationSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form setup with Zod resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Form submission handler
  const onSubmit = async (data: UserCreationFormData) => {
    setIsSubmitting(true);

    try {
      const userCreationData: RegisterUserRequest = {
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
      };

      console.log("## User creation data:", userCreationData);

      const result = await registerUserApi(userCreationData);

      if (result.success) {
        toast.success("User Created", {
          description: `${data.email} has been successfully set up.`,
        });
        router.push("/users"); // Redirect to users list
      } else {
        toast.error("Creation Failed", {
          description: result.error || "Unable to create user",
        });
      }
    } catch (error) {
      console.error("User creation error:", error);
      toast.error("Unexpected Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-8"
    >
      {/* Page Header */}
      <div className="flex items-center mb-6 space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/users")}
          aria-label="Go back to users list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Details Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              User Details
            </CardTitle>
            <CardDescription>
              Enter basic user account information
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Input */}
              <FormField
                label="Email Address"
                name="email"
                errors={errors.email}
                icon={<Mail className="h-4 w-4" />}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      {...field}
                      placeholder="user@example.com"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.email}
                      autoComplete="email"
                    />
                  )}
                />
              </FormField>

              {/* Password Input */}
              <FormField
                label="Password"
                name="password"
                errors={errors.password}
                icon={<KeyRound className="h-4 w-4" />}
              >
                <div className="relative">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="password"
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.password}
                        autoComplete="new-password"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-2">
              {/* Role Selection */}
              <FormField
                label="User Role"
                name="role"
                errors={errors.role}
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        // Reset conditional fields when role changes
                        field.onChange(value as UserRole);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES_CREATE.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              {/* Status Selection */}
              <FormField
                label="User Status"
                name="status"
                errors={errors.status}
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as UserStatus)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select user status" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_STATUS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/users")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
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
