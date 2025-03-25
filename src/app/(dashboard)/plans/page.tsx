"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchPlans } from "@/store/features/plan-slice";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PlansPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, isLoading } = useSelector((state: RootState) => state.plans);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  if (isLoading) {
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
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Subscription Plans
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose a plan that works best for you and your team
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              plan.popular ? "border-primary shadow-md" : ""
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{plan.name}</CardTitle>
                {plan.popular && <Badge>Popular</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-2 min-h-[200px]">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/plans/${plan.id}`}>Select Plan</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-2">Need a custom plan?</h2>
        <p className="text-muted-foreground mb-4">
          Contact our sales team for more information about enterprise-level
          plans and custom solutions tailored to your specific needs.
        </p>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </motion.div>
  );
}
