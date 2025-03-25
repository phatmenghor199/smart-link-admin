"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchPlanById } from "@/store/features/plan-slice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function PlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPlan, isLoading } = useSelector(
    (state: RootState) => state.plans
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPlanById(id as string));
    }
  }, [dispatch, id]);

  if (isLoading || !selectedPlan) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-primary" />
      </div>
    );
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
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedPlan.name} Plan
        </h1>
        {selectedPlan.popular && <Badge className="ml-4">Popular</Badge>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">
                ${selectedPlan.price}
                <span className="text-muted-foreground text-sm font-normal">
                  /month
                </span>
              </h3>
              <p className="text-muted-foreground mt-1">
                {selectedPlan.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, i) => (
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
            <CardTitle>Subscribe to {selectedPlan.name}</CardTitle>
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
                    <span>{selectedPlan.name} (Monthly)</span>
                    <span>${selectedPlan.price}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total (billed monthly)</span>
                    <span>${selectedPlan.price}/mo</span>
                  </div>
                </div>

                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe Now
                </Button>
              </TabsContent>

              <TabsContent value="yearly" className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between">
                    <span>{selectedPlan.name} (Yearly)</span>
                    <span>${(selectedPlan.price * 0.85 * 12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 my-1">
                    <span>Yearly discount (15%)</span>
                    <span>-${(selectedPlan.price * 0.15 * 12).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total (billed yearly)</span>
                    <span>${(selectedPlan.price * 0.85).toFixed(2)}/mo</span>
                  </div>
                </div>

                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe Now
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
