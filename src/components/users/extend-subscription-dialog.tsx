// src/components/shop-admin/extend-subscription-dialog.tsx

import { useEffect, useState } from "react";
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
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
} from "lucide-react";
import { UserProfileModel } from "@/models/user/user-profile.model";
import { formatDate } from "@/lib/utils";

const extendSchema = z.object({
  days: z.number().int().positive("Days must be greater than 0"),
  transactionId: z.string().optional(),
  amountPaid: z.number().min(0, "Amount cannot be negative"),
  notes: z.string().optional(),
});

type ExtendFormData = z.infer<typeof extendSchema>;

interface ExtendSubscriptionDialogProps {
  user: UserProfileModel;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtendFormData) => Promise<void>;
}

export function ExtendSubscriptionDialog({
  user,
  isOpen,
  onClose,
  onSubmit,
}: ExtendSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<ExtendFormData>({
    resolver: zodResolver(extendSchema),
    defaultValues: {
      days: user.activeSubscription?.plan.durationDays || 0,
      transactionId: `EXT-${user.id}-${Date.now()}`,
      amountPaid: user.activeSubscription?.plan.price || 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        days: user.activeSubscription?.plan.durationDays || 0,
        transactionId: `EXT-${user.id}-${Date.now()}`,
        amountPaid: user.activeSubscription?.plan.price || 0,
        notes: "",
      });
    }
  }, [isOpen, user, reset]);

  const handleFormSubmit = async (data: ExtendFormData) => {
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Extend Subscription</DialogTitle>
          <DialogDescription>
            Extend subscription for {user.username}
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
                  <span className="font-medium">End Date:</span>{" "}
                  {formatDate(user.activeSubscription.endDate)}
                </p>
                <p>
                  <span className="font-medium">Days Remaining:</span>{" "}
                  {user.activeSubscription.daysRemaining}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="days" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                Days to Extend
              </Label>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <Input
                    id="days"
                    type="number"
                    {...field}
                    value={field.value || ""}
                    readOnly
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.days && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.days.message}
                </p>
              )}
            </div>

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
                placeholder="Optional notes about this extension"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extending...
                </>
              ) : (
                "Extend Subscription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
