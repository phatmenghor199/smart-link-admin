"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { motion } from "framer-motion";
import { Users, CreditCard, LineChart, Activity, Loader2 } from "lucide-react";
import { fetchAllUsers } from "@/services/users.service";
import { fetchAllPlans } from "@/services/plans.service";
import { toast } from "sonner";
import { User, Plan } from "@/models";

interface DashboardMetrics {
  totalUsers: number;
  totalRevenue: number;
  activePlans: number;
  activeSessions: number;
  userGrowth: number;
  revenueGrowth: number;
  planGrowth: number;
  sessionGrowth: number;
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalRevenue: 0,
    activePlans: 0,
    activeSessions: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    planGrowth: 0,
    sessionGrowth: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch users and plans in parallel
        const [fetchedUsers, fetchedPlans] = await Promise.all([
          fetchAllUsers(),
          fetchAllPlans(),
        ]);

        setUsers(fetchedUsers);
        setPlans(fetchedPlans);

        // Calculate metrics
        calculateMetrics(fetchedUsers, fetchedPlans);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate dashboard metrics from the fetched data
  const calculateMetrics = (users: User[], plans: Plan[]) => {
    // In a real app, these would be calculated from actual data
    // For demo purposes, we'll use the length of arrays and some mock calculations

    const activeUsers = users.filter((user) => user.status === "active");

    // Mock revenue calculation - in reality would come from orders/subscriptions
    const mockRevenuePerUser = 34.27;
    const totalRevenue = activeUsers.length * mockRevenuePerUser;

    // Mock active plans - in reality would be from subscriptions table
    const activePlans = Math.round(activeUsers.length * 0.75);

    // Mock sessions - in reality would come from analytics data
    const activeSessions = Math.round(activeUsers.length * 0.43);

    setMetrics({
      totalUsers: users.length,
      totalRevenue: totalRevenue,
      activePlans: activePlans,
      activeSessions: activeSessions,
      userGrowth: 12, // Mock growth percentages
      revenueGrowth: 20.1,
      planGrowth: 7.4,
      sessionGrowth: 5.4,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics.userGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {metrics.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activePlans.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics.planGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeSessions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{metrics.sessionGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                View your performance metrics over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent activity and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
