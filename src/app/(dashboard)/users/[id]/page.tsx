"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Calendar,
  ShieldCheck,
  CreditCard,
  Loader2,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchUserById } from "@/services/users.service";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { UserProfileModel } from "@/models/user/user-profile.model";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfileModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        // Convert string ID to number
        const userId = Number(params.id);

        if (isNaN(userId)) {
          toast.error("Invalid user ID");
          router.push("/users");
          return;
        }

        const fetchedUser = await fetchUserById(userId);
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.error("Failed to load user details");
        router.push("/users");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserDetails();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex items-center mb-6 space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <Badge variant="outline" className="mt-2">
              {user.userRole}
            </Badge>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email</span>
                </div>
                <p>{user.username}</p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Role</span>
                </div>
                <Badge variant="secondary">{user.userRole}</Badge>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created At</span>
                </div>
                <p>{formatDate(user.createdAt)}</p>
              </div>

              {user.updatedAt && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p>{formatDate(user.updatedAt)}</p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Subscription Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Subscription Details
              </h3>
              {user.hasActiveSubscription && user.activeSubscription ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Plan</span>
                    </div>
                    <Badge variant="outline">
                      {user.activeSubscription.plan.name}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Subscription Ends</span>
                    </div>
                    <p>{formatDate(user.activeSubscription.endDate)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No active subscription</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Information (if available) */}
        {user.shop && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Shop Name</span>
                  <p>{user.shop.name}</p>
                </div>
                <div>
                  <span className="font-medium">Location</span>
                  <p>{user.shop.location}</p>
                </div>
                <div>
                  <span className="font-medium">Created At</span>
                  <p>{formatDate(user.shop.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button onClick={() => router.push(`/users/${user.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" /> Edit User
        </Button>
      </div>
    </motion.div>
  );
}
