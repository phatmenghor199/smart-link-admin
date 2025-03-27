"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  Mail,
  ShieldCheck,
  KeyRound,
  Package,
  Building2,
  MapPin,
  Eye,
  EyeOff,
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
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Imports from our service
import {
  createUserProcess,
  fetchAvailablePlansApi,
  USER_ROLES,
  USER_STATUSES,
  UserRole,
  UserStatus,
} from "@/services/users.service";

// Zod for form validation
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, FieldError } from "react-hook-form";
import FormField from "@/components/form/form-field";

// Create simplified validation schema with proper context typing
const userCreationSchema = z
  .object({
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
    status: z.enum(USER_STATUSES, {
      errorMap: () => ({
        message: "Please select a valid user status",
      }),
    }),

    // Shop Details
    shopName: z.string().optional(),
    shopLocation: z.string().optional(),

    // Subscription Details
    planId: z.number().optional(),
    autoRenew: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If role is SHOP_ADMIN, shop name is required
      if (data.role === "SHOP_ADMIN") {
        return !!data.shopName && data.shopName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Shop name is required for Shop Admin",
      path: ["shopName"],
    }
  )
  .refine(
    (data) => {
      // If role is SHOP_ADMIN, shop location is required
      if (data.role === "SHOP_ADMIN") {
        return !!data.shopLocation && data.shopLocation.trim().length > 0;
      }
      return true;
    },
    {
      message: "Shop location is required for Shop Admin",
      path: ["shopLocation"],
    }
  )
  .refine(
    (data) => {
      // If role is SHOP_ADMIN, plan ID is required
      if (data.role === "SHOP_ADMIN") {
        return data.planId !== undefined;
      }
      return true;
    },
    {
      message: "Plan selection is required for Shop Admin",
      path: ["planId"],
    }
  );

// TypeScript type for form data
type UserCreationFormData = z.infer<typeof userCreationSchema>;

// Type for subscription plan
interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);

  // Form setup with Zod resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      role: "USER", // Default to regular user
      status: "ACTIVE",
      shopName: "",
      shopLocation: "",
      autoRenew: true,
    },
  });

  // Watch selected role to conditionally render shop details
  const selectedRole = watch("role");

  // Fetch available plans on component mount
  useEffect(() => {
    if (selectedRole === "SHOP_ADMIN") {
      const loadPlans = async () => {
        try {
          const plansResponse = await fetchAvailablePlansApi();
          if (plansResponse.success) {
            setAvailablePlans(plansResponse.plans);
          } else {
            toast.error("Failed to load plans", {
              description: plansResponse.error,
            });
          }
        } catch (error) {
          console.error("Error loading plans:", error);
          toast.error("Failed to load subscription plans");
        }
      };

      loadPlans();
    }
  }, [selectedRole]);

  // Form submission handler
  const onSubmit = async (data: UserCreationFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare data for API call
      const userCreationData = {
        user: {
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status,
        },
        ...(data.role === "SHOP_ADMIN" &&
        data.shopName &&
        data.shopLocation &&
        data.planId
          ? {
              shop: {
                name: data.shopName,
                location: data.shopLocation,
              },
              subscription: {
                planId: data.planId,
                autoRenew: data.autoRenew,
              },
            }
          : {}),
      };

      const result = await createUserProcess(userCreationData);

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
      className="px-4 pb-8 max-w-5xl"
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
                        if (value !== "SHOP_ADMIN") {
                          setValue("shopName", "");
                          setValue("shopLocation", "");
                          setValue("planId", undefined);
                        }
                        field.onChange(value as UserRole);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
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
                        {USER_STATUSES.map((status) => (
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

        {/* Shop Admin Only: Shop Details Card */}
        {selectedRole === "SHOP_ADMIN" && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Shop Details
                </CardTitle>
                <CardDescription>
                  Enter information about the shop
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Shop Name */}
                  <FormField
                    label="Shop Name"
                    name="shopName"
                    errors={errors.shopName}
                    icon={<Building2 className="h-4 w-4" />}
                  >
                    <Controller
                      name="shopName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="shopName"
                          {...field}
                          placeholder="My Awesome Shop"
                          disabled={isSubmitting}
                          aria-invalid={!!errors.shopName}
                        />
                      )}
                    />
                  </FormField>

                  {/* Shop Location */}
                  <FormField
                    label="Shop Location"
                    name="shopLocation"
                    errors={errors.shopLocation}
                    icon={<MapPin className="h-4 w-4" />}
                  >
                    <Controller
                      name="shopLocation"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="shopLocation"
                          {...field}
                          placeholder="City, Country"
                          disabled={isSubmitting}
                          aria-invalid={!!errors.shopLocation}
                        />
                      )}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Subscription Details
                </CardTitle>
                <CardDescription>
                  Select a subscription plan for the shop
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {availablePlans.length === 0 ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No subscription plans available</AlertTitle>
                    <AlertDescription>
                      Unable to load subscription plans. Please try again later
                      or contact support.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Plan Selection */}
                    <FormField
                      label="Select Plan"
                      name="planId"
                      errors={errors.planId}
                      icon={<Package className="h-4 w-4" />}
                    >
                      <Controller
                        name="planId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={
                              field.value !== undefined
                                ? field.value.toString()
                                : undefined
                            }
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                            }}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger id="planId">
                              <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePlans.map((plan) => (
                                <SelectItem
                                  key={plan.id}
                                  value={plan.id.toString()}
                                >
                                  {plan.name} - ${plan.price}/month
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>

                    {/* Auto Renew Selection */}
                    <FormField
                      label="Auto Renew"
                      name="autoRenew"
                      errors={errors.autoRenew}
                      icon={<ShieldCheck className="h-4 w-4" />}
                    >
                      <Controller
                        name="autoRenew"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? "true" : "false"}
                            onValueChange={(value) => {
                              field.onChange(value === "true");
                            }}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger id="autoRenew">
                              <SelectValue placeholder="Auto Renew" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">
                                Enabled (Recommended)
                              </SelectItem>
                              <SelectItem value="false">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

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
