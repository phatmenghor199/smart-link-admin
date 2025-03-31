"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Loader2,
  Eye,
  Edit,
  Trash,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllPlans, deletePlan } from "@/services/plans.service";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  PlanFilterOptions,
  PlanModel,
  PlanPaginationModel,
} from "@/models/setting/plan-model";
import {
  PLAN_STATUS_OPTIONS,
  PLAN_TABLE_HEADER,
} from "@/constants/key-page.ts/filter-plan";

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanPaginationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanModel | null>(null);

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  // Fetch plans with filters
  const loadPlans = useCallback(
    async (param: PlanFilterOptions = {}) => {
      setIsLoading(true);

      const filterParams: PlanFilterOptions = {
        search: searchQuery,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        ...param,
      };

      const response = await fetchAllPlans(filterParams);
      if (response) {
        setPlans(response);
      } else {
        console.error("Failed to fetch plans:");
        toast.error("Failed to load plans");
      }
      setIsLoading(false);
    },
    [searchQuery, statusFilter]
  );

  useEffect(() => {
    loadPlans({});
  }, [searchQuery, statusFilter, loadPlans]);

  const handleNextPage = () => {
    if (plans && plans.pageNo < plans.totalPages) {
      loadPlans({ pageNo: plans.pageNo + 1 });
    }
  };

  const handlePreviousPage = () => {
    if (plans && plans.pageNo > 1) {
      loadPlans({ pageNo: plans.pageNo - 1 });
    }
  };

  // Delete plan handler
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      const result = await deletePlan(selectedPlan.id);
      if (result.success) {
        toast.success("Plan deleted successfully");
        loadPlans({}); // Reload plans
      } else {
        toast.error(result.error || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container px-4 pb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Subscription Plans
        </h1>
        <div className="flex items-center space-x-2">
          {/* Reset Filters Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={resetAllFilters}
            title="Reset Filters"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Add Plan Button */}
          <Button onClick={() => router.push("/plans/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Plan Status" />
          </SelectTrigger>
          <SelectContent>
            {PLAN_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Plans Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Table Headers */}
                  {PLAN_TABLE_HEADER.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.content.map((plan, index) => {
                  const noLine = ((plans.pageNo || 1) - 1) * 10 + index + 1;
                  return (
                    <TableRow key={plan.id}>
                      <TableCell>{noLine}</TableCell>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.durationDays} days</TableCell>
                      <TableCell>{formatCurrency(plan.price)}</TableCell>
                      <TableCell>{plan.maxProducts}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            plan.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(plan.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">Open menu</span>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => router.push(`/plans/${plan.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                router.push(`/plans/${plan.id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setSelectedPlan(plan);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {(plans?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {plans?.content.length || 0} of{" "}
                {plans?.totalElements || 0} plans
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={plans?.pageNo === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(plans?.totalPages ?? 0, 5))].map(
                    (_, index) => {
                      // Determine the page number to display
                      let pageToShow;
                      if ((plans?.totalPages ?? 0) <= 5) {
                        // If total pages are 5 or less, show all
                        pageToShow = index + 1;
                      } else {
                        // More complex logic for many pages
                        if ((plans?.pageNo ?? 0) < 3) {
                          // First few pages
                          pageToShow = index + 1;
                        } else if (
                          (plans?.pageNo ?? 0) >=
                          (plans?.totalPages ?? 0) - 2
                        ) {
                          // Last few pages
                          pageToShow = (plans?.totalPages ?? 0) - 4 + index;
                        } else {
                          // Middle pages
                          pageToShow = (plans?.pageNo ?? 0) - 2 + index;
                        }
                      }

                      // Only render if page is valid
                      if (
                        pageToShow >= 1 &&
                        pageToShow <= (plans?.totalPages ?? 0)
                      ) {
                        return (
                          <Button
                            key={pageToShow}
                            variant={
                              pageToShow === plans?.pageNo
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => loadPlans({ pageNo: pageToShow })}
                            className="w-10 p-0"
                          >
                            {pageToShow}
                          </Button>
                        );
                      }
                      return null;
                    }
                  )}

                  {/* Ellipsis if there are more pages */}
                  {(plans?.totalPages ?? 0) > 5 &&
                    (plans?.pageNo ?? 0) < (plans?.totalPages ?? 0) - 2 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={(plans?.pageNo ?? 0) === (plans?.totalPages ?? 0)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedPlan && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the plan &quot;
                {selectedPlan.name}&quot;? This action cannot be undone.
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
      )}
    </motion.div>
  );
}
