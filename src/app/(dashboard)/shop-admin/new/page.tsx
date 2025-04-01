"use client";

import { useState, useEffect } from "react";
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
  CreditCard,
  DollarSign,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { fetchAllPlans } from "@/services/plans.service";

// Import types
import { PlanModel } from "@/models/setting/plan-model";

// Zod for form validation
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { USER_ROLES, USER_STATUS } from "@/constants/key-page.ts/filter-user";
import { UserStatus } from "@/constants/enum/user-enum";
import { createUserProcess } from "@/services/users.service";
import { Label } from "@/components/ui/label";

// Create validation schema
const userCreationSchema = z
  .object({
    // User Details
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(USER_ROLES),
    status: z.enum(USER_STATUS),

    // Shop Details - required for SHOP_ADMIN role
    shopName: z
      .string()
      .min(2, "Shop name must be at least 2 characters")
      .optional(),
    shopLocation: z
      .string()
      .min(2, "Shop location must be at least 2 characters")
      .optional(),

    // Subscription Details
    planId: z.number().optional(),
    autoRenew: z.boolean().default(true),
    transactionId: z.string().optional(),
    amountPaid: z.number().min(0, "Amount paid cannot be negative").optional(),
  })
  .refine(
    (data) => {
      // If role is SHOP_ADMIN, shop name is required
      return (
        data.role !== "SHOP_ADMIN" ||
        (!!data.shopName && data.shopName.trim().length > 0)
      );
    },
    {
      message: "Shop name is required for Shop Admin",
      path: ["shopName"],
    }
  )
  .refine(
    (data) => {
      // If role is SHOP_ADMIN, shop location is required
      return (
        data.role !== "SHOP_ADMIN" ||
        (!!data.shopLocation && data.shopLocation.trim().length > 0)
      );
    },
    {
      message: "Shop location is required for Shop Admin",
      path: ["shopLocation"],
    }
  )
  .refine(
    (data) => {
      // If role is SHOP_ADMIN, plan ID is required
      return data.role !== "SHOP_ADMIN" || data.planId !== undefined;
    },
    {
      message: "Plan selection is required for Shop Admin",
      path: ["planId"],
    }
  );

// TypeScript type for form data
type UserCreationFormData = z.infer<typeof userCreationSchema>;

export default function CreateShopAdminPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PlanModel[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form setup with Zod resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      role: "SHOP_ADMIN",
      status: "ACTIVE",
      shopName: "",
      shopLocation: "",
      autoRenew: true,
      transactionId: `TRANS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amountPaid: 0,
    },
  });

  // Watch selected role and plan ID
  const selectedRole = watch("role");
  const selectedPlanId = watch("planId");

  // Fetch available plans on component mount
  useEffect(() => {
    if (selectedRole === "SHOP_ADMIN") {
      const loadPlans = async () => {
        try {
          const plans = await fetchAllPlans();

          if (plans && plans.content && plans.content.length > 0) {
            // Filter to only show active plans
            const activePlans = plans.content.filter(
              (plan) => plan.status === "ACTIVE"
            );

            setAvailablePlans(activePlans);

            if (activePlans.length === 0) {
              setErrorMessage(
                "No active subscription plans available. Please activate plans first."
              );
            }
          } else {
            setErrorMessage(
              "No subscription plans available. Please create plans first."
            );
            toast.error("No plans available", {
              description: "There are no subscription plans available.",
            });
          }
        } catch (error) {
          console.error("Error loading plans:", error);
          setErrorMessage(
            "Failed to load subscription plans. Please try again."
          );
          toast.error("Failed to load plans");
        }
      };

      loadPlans();
    }
  }, [selectedRole]);

  // Update amount paid when plan changes
  useEffect(() => {
    if (selectedPlanId) {
      const selectedPlan = availablePlans.find(
        (plan) => plan.id === selectedPlanId
      );
      if (selectedPlan) {
        setValue("amountPaid", selectedPlan.price);
      }
    }
  }, [selectedPlanId, availablePlans, setValue]);

  // Form submission handler
  const onSubmit = async (data: UserCreationFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Prepare data for API call

      // Ensure data exists for shop and plan
      if (!data.shopName || !data.shopLocation || !data.planId) {
        setErrorMessage("Shop name, location and plan selection are required");
        setIsSubmitting(false);
        return;
      }

      // Generate transaction ID if not provided
      const transactionId =
        data.transactionId ||
        `TRANS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const userCreationData = {
        user: {
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status,
        },
        shop: {
          name: data.shopName,
          location: data.shopLocation,
        },
        subscription: {
          planId: data.planId,
          autoRenew: data.autoRenew,
          transactionId: transactionId,
          amountPaid: data.amountPaid || 0,
        },
      };

      const result = await createUserProcess(userCreationData);

      if (result.success) {
        toast.success("Shop Admin Created", {
          description: `${data.email} has been successfully set up with their shop.`,
        });
        router.push("/shop-admin"); // Redirect to shop admin list
      } else {
        setErrorMessage(result.error || "Unable to create shop admin");
        toast.error("Creation Failed", {
          description: result.error || "Unable to create shop admin",
        });
      }
    } catch (error) {
      console.error("Shop admin creation error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("Unexpected Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected plan details
  const selectedPlan = selectedPlanId
    ? availablePlans.find((plan) => plan.id === selectedPlanId)
    : null;

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
          onClick={() => router.push("/shop-admin")}
          aria-label="Go back to shop admin list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Shop Admin
          </h1>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Details Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Administrator Details
            </CardTitle>
            <CardDescription>
              Enter account information for the shop administrator
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      {...field}
                      placeholder="admin@example.com"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.email}
                      autoComplete="email"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message?.toString()}
                  </p>
                )}
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  Account Status
                </Label>
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
                {errors.status && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.status.message?.toString()}
                  </p>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">
                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="password"
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password.message?.toString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Details Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Shop Details
            </CardTitle>
            <CardDescription>
              Enter information about the administrator&apos;s shop
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shop Name */}
              <div className="space-y-2">
                <Label htmlFor="shopName">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  Shop Name
                </Label>
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
                {errors.shopName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.shopName.message?.toString()}
                  </p>
                )}
              </div>

              {/* Shop Location */}
              <div className="space-y-2">
                <Label htmlFor="shopLocation">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  Shop Location
                </Label>
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
                {errors.shopLocation && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.shopLocation.message?.toString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details Card */}
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
                  Unable to load subscription plans. Please create or activate
                  plans first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Plan Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="planId">
                      <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                      Select Plan
                    </Label>
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
                          <SelectTrigger id="planId" className="w-full">
                            <SelectValue placeholder="Choose a subscription plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlans.map((plan) => (
                              <SelectItem
                                key={plan.id}
                                value={plan.id.toString()}
                              >
                                <div className="flex items-center justify-between w-full pr-6">
                                  <span>{plan.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    ${plan.price}/month
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.planId && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.planId.message?.toString()}
                      </p>
                    )}
                  </div>

                  {/* Auto Renew Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="autoRenew">
                      <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                      Auto Renew
                    </Label>
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
                    {errors.autoRenew && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.autoRenew.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Transaction ID and Amount Paid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Transaction ID */}
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      Transaction ID
                    </Label>
                    <Controller
                      name="transactionId"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="transactionId"
                          {...field}
                          placeholder="Transaction ID"
                          disabled={isSubmitting}
                          aria-invalid={!!errors.transactionId}
                        />
                      )}
                    />
                    {errors.transactionId && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.transactionId.message?.toString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      A unique identifier for this transaction
                    </p>
                  </div>

                  {/* Amount Paid */}
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      Amount Paid
                    </Label>
                    <Controller
                      name="amountPaid"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="amountPaid"
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          value={field.value?.toString() || "0"}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          placeholder="0.00"
                          disabled={isSubmitting}
                          aria-invalid={!!errors.amountPaid}
                        />
                      )}
                    />
                    {errors.amountPaid && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.amountPaid.message?.toString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Amount paid for this subscription (automatically set to
                      plan price)
                    </p>
                  </div>
                </div>

                {/* Plan Details - Show details of selected plan */}
                {selectedPlan && (
                  <div className="mt-4 p-4 bg-muted/40 rounded-lg border">
                    <h4 className="font-medium mb-2">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">
                          ${selectedPlan.price}/month
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {selectedPlan.durationDays} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Description:
                        </span>
                        <span className="text-sm max-w-xs text-right">
                          {selectedPlan.description}
                        </span>
                      </div>
                      <div className="pt-2 flex flex-wrap gap-2 justify-end">
                        {selectedPlan.allowBanners && (
                          <Badge variant="outline" className="bg-primary/10">
                            Banners
                          </Badge>
                        )}
                        {selectedPlan.allowPromotions && (
                          <Badge variant="outline" className="bg-primary/10">
                            Promotions
                          </Badge>
                        )}
                        {selectedPlan.allowDelivery && (
                          <Badge variant="outline" className="bg-primary/10">
                            Delivery
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/shop-admin")}
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
                Create Shop Admin
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
