// src/components/shop-admin/cancel-subscription-dialog.tsx

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { UserProfileModel } from "@/models/user/user-profile.model";
import { formatDate } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const cancelSchema = z.object({
  reason: z.string().min(5, "Please provide a reason for cancellation"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

interface CancelSubscriptionDialogProps {
  user: UserProfileModel;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export function CancelSubscriptionDialog({
  user,
  isOpen,
  onClose,
  onSubmit,
}: CancelSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleFormSubmit = async (data: CancelFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data.reason);
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            This action will cancel the subscription for {user.username}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cancelling a subscription is permanent and cannot be undone. The
                user will lose access to premium features.
              </AlertDescription>
            </Alert>

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
              <Label htmlFor="reason" className="text-destructive">
                Cancellation Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                {...register("reason")}
                placeholder="Please provide a reason for cancellation"
                disabled={isSubmitting}
                rows={4}
                className="border-destructive/50 focus-visible:ring-destructive/30"
              />
              {errors.reason && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.reason.message}
                </p>
              )}
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
