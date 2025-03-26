"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { fetchPlanById, subscribeToPlan } from "@/services/plans.service";
import { Plan } from "@/models";
import { toast } from "sonner";

export default function PlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const fetchedPlan = await fetchPlanById(id as string);
        if (fetchedPlan) {
          setPlan(fetchedPlan);
        } else {
          toast.error("Plan not found");
          router.push("/plans");
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
        toast.error("Failed to load plan details");
        router.push("/plans");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [id, router]);

  const handleSubscribe = async (billingCycle: "monthly" | "yearly") => {
    if (!plan) return;

    setIsSubscribing(true);
    try {
      // Mock payment details
      const paymentDetails = {
        planId: plan.id,
        billingCycle,
        price: billingCycle === "yearly" ? plan.price * 0.85 * 12 : plan.price,
      };

      const result = await subscribeToPlan(plan.id, paymentDetails);

      if (result.success) {
        toast.success("Subscription successful", {
          description: result.message,
        });
        // In a real app, you might redirect to a success page or dashboard
      } else {
        toast.error("Failed to process subscription");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{plan.name} Plan</h1>
        {plan.popular && <Badge className="ml-4">Popular</Badge>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                ${plan.price}
                <span className="text-muted-foreground text-sm font-normal">
                  /month
                </span>
              </h3>
              <p className="text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscribe to {plan.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly (Save 15%)</TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between">
                    <span>{plan.name} (Monthly)</span>
                    <span>${plan.price}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total (billed monthly)</span>
                    <span>${plan.price}/mo</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSubscribe("monthly")}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="yearly" className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between">
                    <span>{plan.name} (Yearly)</span>
                    <span>${(plan.price * 0.85 * 12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 my-1">
                    <span>Yearly discount (15%)</span>
                    <span>-${(plan.price * 0.15 * 12).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total (billed yearly)</span>
                    <span>${(plan.price * 0.85).toFixed(2)}/mo</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleSubscribe("yearly")}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              By subscribing, you agree to our Terms of Service and Privacy
              Policy. You can cancel your subscription at any time.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-6 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-2">Have questions?</h2>
        <p className="text-muted-foreground mb-4">
          Our team is here to help you find the right plan for your needs.
          Contact us for more information or to discuss custom requirements.
        </p>
        <Button variant="outline">Contact Support</Button>
      </div>
    </motion.div>
  );
}
