// src/app/(dashboard)/shop-admin/[id]/edit/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  changeUserPasswordByAdmin,
  fetchUserById,
  updateUserInfo,
} from "@/services/users.service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { UserProfileModel } from "@/models/user/user-profile.model";
import { USER_STATUS } from "@/constants/key-page.ts/filter-user";
import { UserStatus } from "@/constants/enum/user-enum";
import { Label } from "@/components/ui/label";
import {
  updateShopInfoService,
  updateSubscriptionService,
} from "@/services/shop.service";
import { isEqual } from "lodash";

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
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTab, setSelectedTab] = useState("userInfo");
  const [hasChanges, setHasChanges] = useState(false);

  // Form handling
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
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
      },
    },
  });

  const watchPassword = watch("userInfo.password");
  const watchFormValues = watch();

  // Track form changes
  useEffect(() => {
    if (originalData) {
      // Deep comparison to detect changes, ignoring password fields
      const formValues = { ...watchFormValues };
      const original = { ...originalData };

      // Create comparison objects without password fields
      const formForComparison = {
        userInfo: {
          id: formValues.userInfo.id,
          email: formValues.userInfo.email,
          status: formValues.userInfo.status,
        },
        shopInfo: formValues.shopInfo,
        subscriptionInfo: formValues.subscriptionInfo,
      };

      const originalForComparison = {
        userInfo: {
          id: original.userInfo.id,
          email: original.userInfo.email,
          status: original.userInfo.status,
        },
        shopInfo: original.shopInfo,
        subscriptionInfo: original.subscriptionInfo,
      };

      // Check for password field changes separately
      const hasPasswordChanges = !!watchFormValues.userInfo.password;

      const hasDataChanges = !isEqual(formForComparison, originalForComparison);
      setHasChanges(hasDataChanges || hasPasswordChanges);
    }
  }, [watchFormValues, originalData]);

  const loadData = useCallback(async () => {
    try {
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

      // Create initial form data
      const initialData = {
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
            }
          : undefined,
      };

      // Store original data for comparison
      setOriginalData(initialData);

      // Reset form with fetched data
      reset(initialData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load data"
      );
      toast.error("Failed to load shop admin details");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, reset]);

  // Load user details and plans
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tab = url.searchParams.get("tab");
    if (tab) {
      setSelectedTab(tab);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", selectedTab);
    window.history.pushState({}, "", url);
  }, [selectedTab]);

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // If no changes, just return to detail page
      if (!hasChanges) {
        toast.info("No changes detected");
        router.push(`/shop-admin/${data.userInfo.id}`);
        return;
      }

      // Validate password match if provided
      if (
        data.userInfo.password &&
        data.userInfo.password !== data.userInfo.confirmPassword
      ) {
        setErrorMessage("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      // Check what needs to be updated
      const originalUserInfo = originalData?.userInfo;
      const hasUserInfoChanges =
        originalUserInfo?.email !== data.userInfo.email ||
        originalUserInfo?.status !== data.userInfo.status;

      // 1. Update user info if changed
      if (hasUserInfoChanges) {
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

      // 3. Update shop info if provided and changed
      if (data.shopInfo && user?.shop) {
        const originalShopInfo = originalData?.shopInfo;
        const hasShopChanges =
          originalShopInfo?.name !== data.shopInfo.name ||
          originalShopInfo?.location !== data.shopInfo.location;

        if (hasShopChanges) {
          const shopUpdateResult = await updateShopInfoService(
            user.shop.id,
            data.shopInfo
          );

          if (!shopUpdateResult.success) {
            throw new Error(
              shopUpdateResult.error || "Failed to update shop information"
            );
          }
        }
      }

      // 4. Update subscription info if changed
      if (data.subscriptionInfo && user?.activeSubscription) {
        const originalSubscriptionInfo = originalData?.subscriptionInfo;
        const hasSubscriptionChanges =
          originalSubscriptionInfo?.autoRenew !==
            data.subscriptionInfo.autoRenew ||
          originalSubscriptionInfo?.amountPaid !==
            data.subscriptionInfo.amountPaid;

        if (hasSubscriptionChanges) {
          const subscriptionUpdateResult = await updateSubscriptionService({
            userId: data.userInfo.id,
            transactionId:
              data.subscriptionInfo.transactionId ||
              `UPDATE-${data.userInfo.id}-${Date.now()}`,
            autoRenew: data.subscriptionInfo.autoRenew,
            amountPaid: data.subscriptionInfo.amountPaid || 0,
          });

          if (!subscriptionUpdateResult.success) {
            throw new Error(
              subscriptionUpdateResult.error ||
                "Failed to update subscription information"
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

  // Loading state
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
      className="container mx-auto px-4 pb-8"
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
        <Tabs
          defaultValue="userInfo"
          className="space-y-6"
          onValueChange={(value) => setSelectedTab(value)}
          value={selectedTab}
        >
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
                <CardDescription>View subscription information</CardDescription>
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
                          <span>
                            {user.activeSubscription.daysRemaining > 0
                              ? "Active"
                              : "Expired"}
                          </span>
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
                          {errors.subscriptionInfo?.amountPaid && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {errors.subscriptionInfo.amountPaid.message?.toString()}
                            </p>
                          )}
                        </div>

                        {/* Transaction ID */}
                        <div className="space-y-2">
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
                                placeholder="Transaction ID"
                                disabled={isSubmitting}
                              />
                            )}
                          />
                          <p className="text-xs text-muted-foreground">
                            Optional: Will be auto-generated if left empty
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-4">
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
          <Button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className={!hasChanges ? "opacity-70" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {hasChanges ? "Save Changes" : "No Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
