"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  Tag,
  FileText,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  Activity,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchPlanById, updatePlan } from "@/services/plans.service";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { PlanModel } from "@/models/setting/plan-model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLAN_STATUSES } from "@/constants/key-page.ts/filter-plan";

const planSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  durationDays: z.number().int().positive("Duration must be a positive number"),
  price: z.number().positive("Price must be a positive number"),
  maxProducts: z
    .number()
    .int()
    .positive("Max products must be a positive number"),
  status: z.enum(PLAN_STATUSES),
  allowBanners: z.boolean().default(false),
  allowPromotions: z.boolean().default(false),
  allowDelivery: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function EditPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      durationDays: 30,
      price: 0,
      status: "ACTIVE",
      maxProducts: 0,
      allowBanners: false,
      allowPromotions: false,
      allowDelivery: false,
    },
  });

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

        // Reset form with loaded data
        reset({
          name: planData.name,
          description: planData.description,
          durationDays: planData.durationDays,
          price: planData.price,
          status: planData.status as "ACTIVE" | "INACTIVE",
          maxProducts: planData.maxProducts,
          allowBanners: planData.allowBanners,
          allowPromotions: planData.allowPromotions,
          allowDelivery: planData.allowDelivery,
        });
      } catch (error) {
        console.error("Error loading plan:", error);
        setError("Failed to load plan");
        toast.error("Failed to load plan");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [params.id, reset]);

  const onSubmit = async (data: PlanFormData) => {
    if (!plan) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updatePlan(plan.id, data);

      if (result.success) {
        toast.success("Plan updated successfully");
        router.push("/plans");
      } else {
        setError(result.error || "Failed to update plan");
        toast.error(result.error || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
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
      {/* Page Header */}
      <div className="flex items-center mb-6 space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/plans")}
          aria-label="Go back to plans"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Plan</h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Plan Details Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Plan Details
            </CardTitle>
            <CardDescription>
              Update the information for this subscription plan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Plan Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  Plan Name
                </Label>
                <Input
                  id="name"
                  placeholder="Premium Plan"
                  {...register("name")}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Duration Days */}
              <div className="space-y-2">
                <Label htmlFor="durationDays" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  Duration (Days)
                </Label>
                <Input
                  id="durationDays"
                  type="number"
                  placeholder="30"
                  {...register("durationDays", {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.durationDays}
                />
                {errors.durationDays && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.durationDays.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Advanced plan with all features for established shop owners"
                {...register("description")}
                disabled={isSubmitting}
                rows={4}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="19.99"
                  {...register("price", {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.price}
                />
                {errors.price && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Max Products */}
              <div className="space-y-2">
                <Label htmlFor="maxProducts" className="flex items-center">
                  <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                  Maximum Products
                </Label>
                <Input
                  id="maxProducts"
                  type="number"
                  placeholder="100"
                  {...register("maxProducts", {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.maxProducts}
                />
                {errors.maxProducts && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.maxProducts.message}
                  </p>
                )}
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                  Status
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === "ACTIVE" ? "Active" : "Inactive"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Plan Features
            </CardTitle>
            <CardDescription>
              Update the features available with this plan
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="allowBanners"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="allowBanners"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="allowBanners"
                    className="text-base font-medium cursor-pointer"
                  >
                    Allow Banners
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="allowPromotions"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="allowPromotions"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="allowPromotions"
                    className="text-base font-medium cursor-pointer"
                  >
                    Allow Promotions
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="allowDelivery"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="allowDelivery"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="allowDelivery"
                    className="text-base font-medium cursor-pointer"
                  >
                    Allow Delivery
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/plans")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
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
    </motion.div>
  );
}
