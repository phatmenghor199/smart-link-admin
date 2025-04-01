// src/components/shop-admin/change-plan-dialog.tsx

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CreditCard,
  DollarSign,
  Loader2,
  Package,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserProfileModel } from "@/models/user/user-profile.model";
import { PlanModel } from "@/models/setting/plan-model";
import { fetchAllPlans } from "@/services/plans.service";

const changePlanSchema = z.object({
  newPlanId: z.number().positive("Please select a plan"),
  transactionId: z.string().optional(),
  amountPaid: z.number().min(0, "Amount cannot be negative"),
  notes: z.string().optional(),
});

type ChangePlanFormData = z.infer<typeof changePlanSchema>;

interface ChangePlanDialogProps {
  user: UserProfileModel;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePlanFormData) => Promise<void>;
}

export function ChangePlanDialog({
  user,
  isOpen,
  onClose,
  onSubmit,
}: ChangePlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PlanModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChangePlanFormData>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: {
      newPlanId: undefined,
      transactionId: `CHANGE-${user.id}-${Date.now()}`,
      amountPaid: 0,
      notes: "",
    },
  });

  // Watch for newPlanId to update the amount
  const newPlanId = watch("newPlanId");

  // Fetch all available plans
  useEffect(() => {
    const loadPlans = async () => {
      setIsLoading(true);
      try {
        reset();
        const plans = await fetchAllPlans({
          status: "ACTIVE",
        });

        if (plans) {
          // Filter active plans and exclude current plan if it exists
          const currentPlanId = user.activeSubscription?.plan.id;
          const filteredPlans = plans.content.filter(
            (plan) => plan.id !== currentPlanId
          );

          setAvailablePlans(filteredPlans);
        }
      } catch (error) {
        console.error("Error loading plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPlans();
    }
  }, [isOpen, user.activeSubscription?.plan.id]);

  // Update amount paid when plan changes
  useEffect(() => {
    if (newPlanId) {
      const selectedPlan = availablePlans.find((plan) => plan.id === newPlanId);
      if (selectedPlan) {
        setValue("amountPaid", selectedPlan.price);
      }
    }
  }, [newPlanId, availablePlans, setValue]);

  const handleFormSubmit = async (data: ChangePlanFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the selected plan details
  const selectedPlan = availablePlans.find((plan) => plan.id === newPlanId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Subscription Plan</DialogTitle>
          <DialogDescription>
            Change subscription plan for {user.username}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            {user.activeSubscription && (
              <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                <p>
                  <span className="font-medium">Current Plan:</span>{" "}
                  {user.activeSubscription.plan.name}
                </p>
                <p>
                  <span className="font-medium">Price:</span> $
                  {user.activeSubscription.plan.price}/month
                </p>
                <p>
                  <span className="font-medium">Days Remaining:</span>{" "}
                  {user.activeSubscription.daysRemaining}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPlanId" className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                New Plan
              </Label>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading plans...
                  </span>
                </div>
              ) : (
                <Controller
                  name="newPlanId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isSubmitting || availablePlans.length === 0}
                    >
                      <SelectTrigger id="newPlanId">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            <div className="flex justify-between w-full">
                              <span>{plan.name}</span>
                              <span className="ml-2 text-muted-foreground">
                                ${plan.price}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.newPlanId && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.newPlanId.message}
                </p>
              )}
              {availablePlans.length === 0 && !isLoading && (
                <p className="text-sm text-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  No other active plans available
                </p>
              )}
            </div>

            {selectedPlan && (
              <div className="bg-primary/10 p-3 rounded-md space-y-2 border">
                <div className="flex justify-between">
                  <span className="font-medium">Selected Plan:</span>
                  <span>{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span>${selectedPlan.price}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{selectedPlan.durationDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Features:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedPlan.allowBanners && (
                      <Badge variant="outline">Banners</Badge>
                    )}
                    {selectedPlan.allowPromotions && (
                      <Badge variant="outline">Promotions</Badge>
                    )}
                    {selectedPlan.allowDelivery && (
                      <Badge variant="outline">Delivery</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amountPaid" className="flex items-center">
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
                    step="0.01"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.amountPaid && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.amountPaid.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                Transaction ID
              </Label>
              <Input
                id="transactionId"
                {...register("transactionId")}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated if left empty
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Optional notes about this plan change"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !newPlanId || availablePlans.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Plan...
                </>
              ) : (
                "Change Plan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
