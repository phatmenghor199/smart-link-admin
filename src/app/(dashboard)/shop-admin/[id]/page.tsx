// src/app/(dashboard)/shop-admin/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Loader2,
  ArrowLeft,
  Building2,
  MapPin,
  Package,
  Check,
  X as XIcon,
  Pencil,
  RefreshCw,
  AlertCircle,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { UserProfileModel } from "@/models/user/user-profile.model";
import {
  cancelSubscription,
  changePlan,
  extendSubscription,
  fetchUserById,
} from "@/services/users.service";
import { CancelSubscriptionDialog } from "@/components/users/cancel-subscription-dialog";
import { ChangePlanDialog } from "@/components/users/change-plan-dialog";
import { ExtendSubscriptionDialog } from "@/components/users/extend-subscription-dialog";
// import {
//   extendSubscription,
//   changePlan,
//   cancelSubscription,
// } from "@/services/subscription.service";

export default function ShopAdminDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfileModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const loadUserDetails = useCallback(async () => {
    try {
      // Convert string ID to number
      const userId = Number(params.id);

      if (isNaN(userId)) {
        setError("Invalid user ID");
        toast.error("Invalid user ID");
        return;
      }

      const fetchedUser = await fetchUserById({ userId });

      if (!fetchedUser) {
        setError("Shop admin not found");
        toast.error("Shop admin not found");
        return;
      }

      // Verify the user is a SHOP_ADMIN
      if (fetchedUser.userRole !== "SHOP_ADMIN") {
        setError("The specified user is not a shop admin");
        toast.error("The specified user is not a shop admin");
        return;
      }

      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to fetch shop admin details:", error);
      setError("Failed to load shop admin details");
      toast.error("Failed to load shop admin details");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadUserDetails();
  }, [loadUserDetails, params.id, router]);

  const handleEditUser = () => {
    if (user) {
      router.push(`/shop-admin/${user.id}/edit`);
    }
  };

  const handleExtendSubscription = async (data: {
    days: number;
    transactionId?: string;
    amountPaid: number;
    notes?: string;
  }) => {
    if (!user) return;

    try {
      const result = await extendSubscription({
        userId: user.id,
        transactionId: data.transactionId || `EXT-${user.id}-${Date.now()}`,
        amountPaid: data.amountPaid,
        notes: data.notes,
      });

      if (result.success) {
        toast.success("Subscription extended successfully");
        setIsExtendDialogOpen(false);
        // Reload user data to show updated subscription information
        loadUserDetails();
      } else {
        toast.error(result.message || "Failed to extend subscription");
      }
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleChangePlan = async (data: {
    newPlanId: number;
    transactionId?: string;
    amountPaid: number;
    notes?: string;
  }) => {
    if (!user) return;

    try {
      const result = await changePlan({
        userId: user.id,
        newPlanId: data.newPlanId,
        transactionId: data.transactionId || `CHANGE-${user.id}-${Date.now()}`,
        amountPaid: data.amountPaid,
        notes: data.notes,
      });

      if (result.success) {
        toast.success("Plan changed successfully");
        setIsChangePlanDialogOpen(false);
        // Reload user data to show updated subscription information
        loadUserDetails();
      } else {
        toast.error(result.message || "Failed to change plan");
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleCancelSubscription = async (reason: string) => {
    if (!user) return;

    try {
      const result = await cancelSubscription(user.id, reason);

      if (result.success) {
        toast.success("Subscription cancelled successfully");
        setIsCancelDialogOpen(false);
        // Reload user data to show updated subscription information
        loadUserDetails();
      } else {
        toast.error(result.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("An unexpected error occurred");
    }
  };

  // Calculate subscription days remaining (formatted)
  const getSubscriptionStatus = () => {
    if (!user?.hasActiveSubscription || !user?.activeSubscription) {
      return <Badge variant="destructive">No Subscription</Badge>;
    }

    const daysRemaining = user.activeSubscription.daysRemaining;

    if (daysRemaining <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysRemaining <= 7) {
      return (
        <Badge variant="default" className="bg-yellow-500 text-white">
          Expiring Soon ({daysRemaining} days)
        </Badge>
      );
    } else {
      return <Badge variant="default">Active ({daysRemaining} days)</Badge>;
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

  // Error state
  if (error || !user) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Shop admin not found"}</AlertDescription>
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
      className="container px-4 pb-8"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/shop-admin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Shop Admin Details
            </h1>
          </div>
        </div>
        <Button onClick={handleEditUser}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Shop Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-1">{user.username}</h2>
            <Badge variant="outline" className="mb-2">
              {user.userRole}
            </Badge>
            <Badge
              variant={user.status === "ACTIVE" ? "default" : "destructive"}
            >
              {user.status}
            </Badge>

            <Separator className="my-4" />

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Created:</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              {user.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(user.updatedAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 text-primary mr-2" />
              Shop Information
            </CardTitle>
            <CardDescription>
              Details about the administrator&apos;s shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.shop ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Shop Name</p>
                    <p className="font-medium text-lg">{user.shop.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {user.shop.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      {formatDate(user.shop.createdAt)}
                    </p>
                  </div>
                  {user.shop.updatedAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="font-medium">
                        {formatDate(user.shop.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No shop information available. Please add shop details for
                  this admin.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 text-primary mr-2" />
              Subscription Details
            </CardTitle>
            <CardDescription>
              Current subscription plan and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.hasActiveSubscription && user.activeSubscription ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {user.activeSubscription.plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.activeSubscription.plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatCurrency(user.activeSubscription.plan.price)}
                      <span className="text-sm text-muted-foreground">
                        /month
                      </span>
                    </div>
                    <div>{getSubscriptionStatus()}</div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Subscription ID
                    </p>
                    <p className="font-medium">{user.activeSubscription.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {formatDate(user.activeSubscription.startDate)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {formatDate(user.activeSubscription.endDate)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Auto Renew</p>
                    <p className="flex items-center font-medium">
                      {user.activeSubscription.autoRenew ? (
                        <>
                          <Check className="text-green-500 h-4 w-4 mr-1" />{" "}
                          Enabled
                        </>
                      ) : (
                        <>
                          <XIcon className="text-red-500 h-4 w-4 mr-1" />{" "}
                          Disabled
                        </>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Transaction ID
                    </p>
                    <p className="font-medium">
                      {user.activeSubscription.transactionId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="font-medium">
                      {formatCurrency(user.activeSubscription.amountPaid)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Plan Features</h4>
                  <div className="flex flex-wrap gap-2">
                    <PlanFeature
                      title="Max Products"
                      value={user.activeSubscription.plan.maxProducts.toString()}
                    />
                    <PlanFeature
                      title="Banners"
                      enabled={user.activeSubscription.plan.allowBanners}
                    />
                    <PlanFeature
                      title="Promotions"
                      enabled={user.activeSubscription.plan.allowPromotions}
                    />
                    <PlanFeature
                      title="Delivery"
                      enabled={user.activeSubscription.plan.allowDelivery}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active subscription. This shop admin does not have an
                  active subscription plan.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          {user.hasActiveSubscription && user.activeSubscription && (
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsExtendDialogOpen(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Extend Subscription
              </Button>
              <Button onClick={() => setIsChangePlanDialogOpen(true)}>
                <Package className="mr-2 h-4 w-4" />
                Change Plan
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Extend Subscription Dialog */}
      {user.hasActiveSubscription && user.activeSubscription && (
        <ExtendSubscriptionDialog
          user={user}
          isOpen={isExtendDialogOpen}
          onClose={() => setIsExtendDialogOpen(false)}
          onSubmit={handleExtendSubscription}
        />
      )}

      {/* Change Plan Dialog */}
      {user.hasActiveSubscription && user.activeSubscription && (
        <ChangePlanDialog
          user={user}
          isOpen={isChangePlanDialogOpen}
          onClose={() => setIsChangePlanDialogOpen(false)}
          onSubmit={handleChangePlan}
        />
      )}

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

// Plan Feature Display Component
function PlanFeature({
  title,
  enabled,
  value,
}: {
  title: string;
  enabled?: boolean;
  value?: string;
}) {
  // If we have a specific value, show that
  if (value) {
    return (
      <div className="flex items-center bg-primary/5 px-3 py-1 rounded-full border">
        <span className="font-medium">{title}:</span>
        <span className="ml-1">{value}</span>
      </div>
    );
  }

  // Otherwise show as enabled/disabled feature
  return (
    <div
      className={`flex items-center px-3 py-1 rounded-full border ${
        enabled
          ? "bg-green-500/10 border-green-500/20"
          : "bg-red-500/10 border-red-500/20"
      }`}
    >
      {enabled ? (
        <Check className="text-green-500 h-4 w-4 mr-1" />
      ) : (
        <XIcon className="text-red-500 h-4 w-4 mr-1" />
      )}
      <span>{title}</span>
    </div>
  );
}
