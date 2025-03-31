"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  X as XIcon,
  Edit,
  Trash,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchPlanById, deletePlan } from "@/services/plans.service";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PlanModel } from "@/models/setting/plan-model";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const planId = Number(params.id);
        if (isNaN(planId)) {
          throw new Error("Invalid plan ID");
        }

        const planData = await fetchPlanById(planId);
        if (!planData) {
          throw new Error("Plan not found");
        }

        setPlan(planData);
      } catch (error) {
        console.error("Error loading plan:", error);
        toast.error("Failed to load plan");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [params.id]);

  const handleDeletePlan = async () => {
    if (!plan) return;

    try {
      const result = await deletePlan(plan.id);
      if (result.success) {
        toast.success("Plan deleted successfully");
        router.push("/plans");
      } else {
        toast.error(result.error || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Plan not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.push("/plans")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
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
      {/* Page Header with proper plan name, status and description */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/plans")}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => router.push(`/plans/${plan.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground mb-8">
        {plan.description || "No description available for this plan."}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Core information about this plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="text-muted-foreground">Price:</div>
              <div className="font-medium">{formatCurrency(plan.price)}</div>

              <div className="text-muted-foreground">Status:</div>
              <div>
                <Badge
                  variant={plan.status === "ACTIVE" ? "default" : "secondary"}
                >
                  {plan.status}
                </Badge>
              </div>

              <div className="text-muted-foreground">Duration:</div>
              <div className="font-medium">{plan.durationDays} days</div>

              <div className="text-muted-foreground">Max Products:</div>
              <div className="font-medium">{plan.maxProducts}</div>

              <div className="text-muted-foreground">Created:</div>
              <div>{formatDate(plan.createdAt)}</div>

              {plan.updatedAt && (
                <>
                  <div className="text-muted-foreground">Last Updated:</div>
                  <div>{formatDate(plan.updatedAt)}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>Features included in this plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {plan.allowBanners ? (
                    <Check className="text-green-500 mr-2 h-5 w-5" />
                  ) : (
                    <XIcon className="text-red-500 mr-2 h-5 w-5" />
                  )}
                  Banner Support
                </span>
                <Badge variant={plan.allowBanners ? "default" : "outline"}>
                  {plan.allowBanners ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {plan.allowPromotions ? (
                    <Check className="text-green-500 mr-2 h-5 w-5" />
                  ) : (
                    <XIcon className="text-red-500 mr-2 h-5 w-5" />
                  )}
                  Promotions
                </span>
                <Badge variant={plan.allowPromotions ? "default" : "outline"}>
                  {plan.allowPromotions ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  {plan.allowDelivery ? (
                    <Check className="text-green-500 mr-2 h-5 w-5" />
                  ) : (
                    <XIcon className="text-red-500 mr-2 h-5 w-5" />
                  )}
                  Delivery Service
                </span>
                <Badge variant={plan.allowDelivery ? "default" : "outline"}>
                  {plan.allowDelivery ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the plan &quot;{plan.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
