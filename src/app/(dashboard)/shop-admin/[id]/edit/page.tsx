// src/app/(dashboard)/shop-admin/[id]/edit/page.tsx

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
  Building2,
  MapPin,
  Eye,
  EyeOff,
  Package,
  CreditCard,
  DollarSign,
  Calendar,
  Ban,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  cancelSubscription,
  changePlan,
  changeUserPasswordByAdmin,
  extendSubscription,
  fetchUserById,
  updateUserInfo,
} from "@/services/users.service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { UserProfileModel } from "@/models/user/user-profile.model";
import { fetchAllPlans } from "@/services/plans.service";
import { PlanModel } from "@/models/setting/plan-model";
import { USER_STATUS } from "@/constants/key-page.ts/filter-user";
import { UserStatus } from "@/constants/enum/user-enum";
import { CancelSubscriptionDialog } from "@/components/users/cancel-subscription-dialog";

// Define validation schemas for the different sections
const userInfoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  status: z.enum(USER_STATUS, {
    errorMap: () => ({ message: "Please select a valid user status" }),
  }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
});

const shopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  location: z.string().min(2, "Shop location must be at least 2 characters"),
});

const subscriptionSchema = z.object({
  planId: z.number().optional(),
  autoRenew: z.boolean().default(true),
  transactionId: z.string().optional(),
  amountPaid: z.number().min(0, "Amount paid cannot be negative").optional(),
  extendDays: z.number().min(0, "Days must be a positive number").optional(),
});

// Combine the schemas
const combinedSchema = z.object({
  userInfo: userInfoSchema.extend({
    id: z.number(),
  }),
  shopInfo: shopSchema.optional(),
  subscriptionInfo: subscriptionSchema.optional(),
});

type FormData = z.infer<typeof combinedSchema>;

export default function EditShopAdminPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfileModel | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PlanModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Form handling
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      userInfo: {
        id: 0,
        email: "",
        status: "ACTIVE" as const,
        password: "",
        confirmPassword: "",
      },
      shopInfo: {
        name: "",
        location: "",
      },
      subscriptionInfo: {
        planId: undefined,
        autoRenew: true,
        transactionId: "",
        amountPaid: 0,
        extendDays: 0,
      },
    },
  });

  const watchPassword = watch("userInfo.password");
  const watchPlanId = watch("subscriptionInfo.planId");

  // Load user details and plans
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Convert string ID to number
        const userId = Number(params.id);

        if (isNaN(userId)) {
          throw new Error("Invalid user ID");
        }

        // Load user data
        const fetchedUser = await fetchUserById({ userId });

        if (!fetchedUser) {
          throw new Error("User not found");
        }

        // Verify the user is a SHOP_ADMIN
        if (fetchedUser.userRole !== "SHOP_ADMIN") {
          throw new Error("The specified user is not a shop admin");
        }

        setUser(fetchedUser);

        // Load available plans
        const plans = await fetchAllPlans();
        if (plans && plans.content) {
          setAvailablePlans(plans.content);
        }

        // Reset form with fetched data
        reset({
          userInfo: {
            id: fetchedUser.id,
            email: fetchedUser.username,
            status: fetchedUser.status || "ACTIVE",
            password: "",
            confirmPassword: "",
          },
          shopInfo: fetchedUser.shop
            ? {
                name: fetchedUser.shop.name,
                location: fetchedUser.shop.location,
              }
            : undefined,
          subscriptionInfo: fetchedUser.activeSubscription
            ? {
                planId: fetchedUser.activeSubscription.plan.id,
                autoRenew: fetchedUser.activeSubscription.autoRenew,
                transactionId: fetchedUser.activeSubscription.transactionId,
                amountPaid: fetchedUser.activeSubscription.amountPaid,
                extendDays: 0,
              }
            : undefined,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load data"
        );
        toast.error("Failed to load shop admin details");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id, reset]);

  // Update amount paid when plan changes
  useEffect(() => {
    if (watchPlanId) {
      const selectedPlan = availablePlans.find(
        (plan) => plan.id === watchPlanId
      );
      if (selectedPlan) {
        setValue("subscriptionInfo.amountPaid", selectedPlan.price);
      }
    }
  }, [watchPlanId, availablePlans, setValue]);

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Validate password match if provided
      if (
        data.userInfo.password &&
        data.userInfo.password !== data.userInfo.confirmPassword
      ) {
        setErrorMessage("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      // 1. Update user info
      const userUpdateResult = await updateUserInfo(data.userInfo.id, {
        username: data.userInfo.email,
        role: "SHOP_ADMIN", // Keep the role as SHOP_ADMIN
        status: data.userInfo.status,
      });

      if (!userUpdateResult.success) {
        throw new Error(
          userUpdateResult.error || "Failed to update user information"
        );
      }

      // 2. If password is provided, change the password
      if (data.userInfo.password) {
        const passwordChangeResult = await changeUserPasswordByAdmin({
          id: data.userInfo.id,
          newPassword: data.userInfo.password,
          confirmNewPassword:
            data.userInfo.confirmPassword || data.userInfo.password,
        });

        if (!passwordChangeResult.success) {
          throw new Error(
            passwordChangeResult.error || "Failed to update password"
          );
        }
      }

      // 3. Update shop info if provided
      if (data.shopInfo && user?.shop) {
        const shopUpdateResult = await updateShopInfo(
          user.shop.id,
          data.shopInfo
        );

        if (!shopUpdateResult.success) {
          throw new Error(
            shopUpdateResult.error || "Failed to update shop information"
          );
        }
      }

      // 4. Update subscription if provided
      if (data.subscriptionInfo && user?.activeSubscription && user?.id) {
        // Handle subscription update or extension
        if (
          data.subscriptionInfo.extendDays &&
          data.subscriptionInfo.extendDays > 0
        ) {
          // Extend subscription
          const extensionResult = await extendSubscription({
            userId: user.id,
            transactionId:
              data.subscriptionInfo.transactionId || `EXT-${Date.now()}`,
            amountPaid: data.subscriptionInfo.amountPaid || 0,
            notes: "Extended from admin panel",
          });

          if (!extensionResult.success) {
            throw new Error(
              extensionResult.message || "Failed to extend subscription"
            );
          }
        } else if (
          data.subscriptionInfo.planId !== user.activeSubscription.plan.id
        ) {
          // Change plan
          const changePlanResult = await changePlan({
            userId: user.id,
            newPlanId: data.subscriptionInfo.planId!,
            transactionId:
              data.subscriptionInfo.transactionId || `CHANGE-${Date.now()}`,
            amountPaid: data.subscriptionInfo.amountPaid || 0,
            notes: "Plan changed from admin panel",
          });

          if (!changePlanResult.success) {
            throw new Error(
              changePlanResult.message || "Failed to change subscription plan"
            );
          }
        } else {
          // Update auto-renew setting
          // Note: This would need a separate API endpoint to just update auto-renew setting
          // For now, we'll assume this might be handled by reapplying the same plan
          const changePlanResult = await changePlan({
            userId: user.id,
            newPlanId: data.subscriptionInfo.planId!,
            transactionId:
              data.subscriptionInfo.transactionId || `UPDATE-${Date.now()}`,
            amountPaid: 0, // No charge for just changing auto-renew
            notes: "Updated subscription settings from admin panel",
          });

          if (!changePlanResult.success) {
            throw new Error(
              changePlanResult.message || "Failed to update subscription"
            );
          }
        }
      }

      toast.success("Shop admin updated successfully");
      router.push(`/shop-admin/${data.userInfo.id}`);
    } catch (error) {
      console.error("Failed to update shop admin:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      toast.error("Failed to update shop admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async (reason: string) => {
    if (!user) return;

    try {
      const result = await cancelSubscription(user.id, reason);

      if (result.success) {
        toast.success("Subscription cancelled successfully");
        setIsCancelDialogOpen(false);

        // Redirect to the user details page after cancellation
        router.push(`/shop-admin/${user.id}`);
      } else {
        toast.error(result.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("An unexpected error occurred while cancelling subscription");
    }
  };

  // Helper to get selected plan details
  const getSelectedPlan = () => {
    const planId = watch("subscriptionInfo.planId");
    return planId ? availablePlans.find((plan) => plan.id === planId) : null;
  };

  const selectedPlan = getSelectedPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage || "Shop admin not found"}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/shop-admin")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop Admins
        </Button>
      </div>
    );
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
          onClick={() => router.push(`/shop-admin/${user.id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Shop Admin</h1>
          <p className="text-muted-foreground">
            Update information for {user.username}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="userInfo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="userInfo" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="shopInfo" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Shop</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriptionInfo"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Information Tab */}
          <TabsContent value="userInfo">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update the admin&apos;s account details and change password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="userInfo.email"
                      className="flex items-center"
                    >
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Controller
                      name="userInfo.email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="admin@example.com"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    {errors.userInfo?.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.userInfo.email.message?.toString()}
                      </p>
                    )}
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="userInfo.status"
                      className="flex items-center"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                      Account Status
                    </Label>
                    <Controller
                      name="userInfo.status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value as UserStatus)
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user status" />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_STATUS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0) +
                                  status.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.userInfo?.status && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.userInfo.status.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* New Password Input */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="userInfo.password"
                        className="flex items-center"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                        New Password
                      </Label>
                      <div className="relative">
                        <Controller
                          name="userInfo.password"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Leave blank to keep current password"
                              disabled={isSubmitting}
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
                      {errors.userInfo?.password && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.userInfo.password.message?.toString()}
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password Input */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="userInfo.confirmPassword"
                        className="flex items-center"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                        Confirm New Password
                      </Label>
                      <Controller
                        name="userInfo.confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            disabled={isSubmitting || !watchPassword}
                            autoComplete="new-password"
                          />
                        )}
                      />
                      {errors.userInfo?.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.userInfo.confirmPassword.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Leave blank if you don&apos;t want to change the password
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Information Tab */}
          <TabsContent value="shopInfo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Shop Details
                </CardTitle>
                <CardDescription>
                  Update information about the administrator&apos;s shop
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {user.shop ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Shop Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="shopInfo.name"
                        className="flex items-center"
                      >
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        Shop Name
                      </Label>
                      <Controller
                        name="shopInfo.name"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Shop Name"
                            disabled={isSubmitting}
                          />
                        )}
                      />
                      {errors.shopInfo?.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.shopInfo.name.message?.toString()}
                        </p>
                      )}
                    </div>

                    {/* Shop Location */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="shopInfo.location"
                        className="flex items-center"
                      >
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        Shop Location
                      </Label>
                      <Controller
                        name="shopInfo.location"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="City, Country"
                            disabled={isSubmitting}
                          />
                        )}
                      />
                      {errors.shopInfo?.location && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.shopInfo.location.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No shop information available for this admin.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Information Tab */}
          <TabsContent value="subscriptionInfo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Subscription Details
                </CardTitle>
                <CardDescription>
                  Update or extend the subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.activeSubscription ? (
                  <>
                    {/* Current Subscription Info */}
                    <div className="bg-muted/40 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Current Subscription</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">
                            Plan:
                          </span>
                          <span className="font-medium">
                            {user.activeSubscription.plan.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Status:
                          </span>
                          <Badge
                            variant={
                              user.activeSubscription.daysRemaining > 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {user.activeSubscription.daysRemaining > 0
                              ? "Active"
                              : "Expired"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Expires in:
                          </span>
                          <span className="font-medium">
                            {user.activeSubscription.daysRemaining} days
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Start Date:
                          </span>
                          <span>
                            {new Date(
                              user.activeSubscription.startDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            End Date:
                          </span>
                          <span>
                            {new Date(
                              user.activeSubscription.endDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Auto Renew:
                          </span>
                          <span>
                            {user.activeSubscription.autoRenew
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Subscription Options</h4>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Plan Selection */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="subscriptionInfo.planId"
                            className="flex items-center"
                          >
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            Change Plan
                          </Label>
                          <Controller
                            name="subscriptionInfo.planId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value?.toString()}
                                onValueChange={(value) =>
                                  field.onChange(Number(value))
                                }
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availablePlans
                                    .filter((plan) => plan.status === "ACTIVE")
                                    .map((plan) => (
                                      <SelectItem
                                        key={plan.id}
                                        value={plan.id.toString()}
                                      >
                                        <div className="flex items-center justify-between w-full">
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
                        </div>

                        {/* Auto-Renew */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="subscriptionInfo.autoRenew"
                            className="flex items-center"
                          >
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            Auto Renew
                          </Label>
                          <Controller
                            name="subscriptionInfo.autoRenew"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value ? "true" : "false"}
                                onValueChange={(value) =>
                                  field.onChange(value === "true")
                                }
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Auto renew setting" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">
                                    Enabled (Recommended)
                                  </SelectItem>
                                  <SelectItem value="false">
                                    Disabled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-4">
                        {/* Extend Days */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="subscriptionInfo.extendDays"
                            className="flex items-center"
                          >
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            Extend Subscription (Days)
                          </Label>
                          <Controller
                            name="subscriptionInfo.extendDays"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                placeholder="0"
                                value={field.value?.toString() || "0"}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                                disabled={isSubmitting}
                              />
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter days to extend the current subscription
                          </p>
                        </div>

                        {/* Amount Paid */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="subscriptionInfo.amountPaid"
                            className="flex items-center"
                          >
                            <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                            Amount Paid
                          </Label>
                          <Controller
                            name="subscriptionInfo.amountPaid"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={field.value?.toString() || "0"}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                disabled={isSubmitting}
                              />
                            )}
                          />
                        </div>
                      </div>

                      {/* Transaction ID */}
                      <div className="space-y-2 mt-4">
                        <Label
                          htmlFor="subscriptionInfo.transactionId"
                          className="flex items-center"
                        >
                          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                          Transaction ID
                        </Label>
                        <Controller
                          name="subscriptionInfo.transactionId"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Transaction ID for the change or extension"
                              disabled={isSubmitting}
                            />
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Will be auto-generated if left empty
                        </p>
                      </div>
                    </div>

                    {/* Selected Plan Details */}
                    {selectedPlan &&
                      selectedPlan.id !== user.activeSubscription.plan.id && (
                        <div className="mt-4 p-4 bg-muted/40 rounded-lg border">
                          <h4 className="font-medium mb-2">New Plan Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Name:
                              </span>
                              <span className="font-medium">
                                {selectedPlan.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Price:
                              </span>
                              <span className="font-medium">
                                ${selectedPlan.price}/month
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
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
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10"
                                >
                                  Banners
                                </Badge>
                              )}
                              {selectedPlan.allowPromotions && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10"
                                >
                                  Promotions
                                </Badge>
                              )}
                              {selectedPlan.allowDelivery && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10"
                                >
                                  Delivery
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Cancel Subscription */}
                    <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <h4 className="font-medium text-destructive mb-2">
                        Danger Zone
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cancelling a subscription will immediately remove the
                        user&apos;s access to premium features. This action
                        cannot be undone.
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setIsCancelDialogOpen(true)}
                        disabled={isSubmitting}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </Button>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No active subscription found for this shop admin.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons - Fixed at the bottom */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/shop-admin/${user.id}`)}
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

      {/* Cancel Subscription Dialog */}
      {user.activeSubscription && (
        <CancelSubscriptionDialog
          user={user}
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onSubmit={handleCancelSubscription}
        />
      )}
    </motion.div>
  );
}

// Simple Label component
const Label = ({ children, ...props }: React.ComponentProps<"label">) => (
  <label {...props} className="flex items-center text-sm font-medium">
    {children}
  </label>
);
