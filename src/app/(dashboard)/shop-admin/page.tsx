"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  getAllShopAdminService,
  UserFilterOptions,
} from "@/services/users.service";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  UserProfileModel,
  UserProfilePaginationModel,
} from "@/models/user/user-profile.model";
import {
  SUBSCRIPTION_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/constants/filter-user";
import { shopAdminTableHeader } from "@/constants/table-header.ts/customer";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfilePaginationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [subscriptionFilter, setSubscriptionFilter] = useState("ALL");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfileModel | null>(
    null
  );

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSubscriptionFilter("ALL");
  };

  // Fetch users with filters
  const loadUsers = useCallback(
    async (param: UserFilterOptions) => {
      setIsLoading(true);

      const response = await getAllShopAdminService({
        search: searchQuery,
        role: "SHOP_ADMIN",
        status: statusFilter === "ALL" ? undefined : statusFilter,
        hasActiveSubscription:
          subscriptionFilter === "ALL"
            ? undefined
            : subscriptionFilter === "ACTIVE",
        ...param,
      });

      if (response) {
        setUsers(response);
      } else {
        console.error("Failed to fetch users:");
        toast.error("Failed to load users");
      }
      setIsLoading(false);
    },
    [searchQuery, statusFilter, subscriptionFilter]
  );

  useEffect(() => {
    loadUsers({});
  }, [searchQuery, statusFilter, subscriptionFilter, loadUsers]);

  const handleNextPage = () => {
    if (users && users.pageNo < users.totalPages - 1) {
      loadUsers({ pageNo: users.pageNo + 1 });
    }
  };

  const handlePreviousPage = () => {
    if (users && users.pageNo > 0) {
      loadUsers({ pageNo: users.pageNo - 1 });
    }
  };

  // Delete user handler
  const handleDeleteUser = async () => {};

  return (
    <div className="container px-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Shop Admin</h1>
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

          {/* Add User Button */}
          <Button onClick={() => router.push("/shop-admin/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Shop
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="User Status" />
          </SelectTrigger>
          <SelectContent>
            {USER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subscription Filter */}
        <Select
          value={subscriptionFilter}
          onValueChange={setSubscriptionFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            {SUBSCRIPTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Table Headers */}
                  {shopAdminTableHeader.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.content.map((user, index) => {
                  const noLine = ((users.pageNo || 1) - 1) * 10 + index + 1;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{noLine}</TableCell>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.userRole}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "ACTIVE"
                              ? "default"
                              : user.status === "INACTIVE"
                              ? "secondary"
                              : user.status === "SUSPENDED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {user.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.hasActiveSubscription ? "default" : "secondary"
                          }
                        >
                          {user.hasActiveSubscription
                            ? "Active"
                            : "No Subscription"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.activeSubscription?.daysRemaining ?? "N/A"}
                      </TableCell>
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
                              onSelect={() => router.push(`/users/${user.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                router.push(`/users/${user.id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setSelectedUser(user);
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

          {(users?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {users?.content.length || 0} of{" "}
                {users?.totalElements || 0} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={users?.pageNo === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(users?.totalPages ?? 0, 5))].map(
                    (_, index) => {
                      // Determine the page number to display
                      let pageToShow;
                      if ((users?.totalPages ?? 0) <= 5) {
                        // If total pages are 5 or less, show all
                        pageToShow = index;
                      } else {
                        // More complex logic for many pages
                        if ((users?.pageNo ?? 0) < 2) {
                          // First two pages
                          pageToShow = index;
                        } else if (
                          (users?.pageNo ?? 0) >=
                          (users?.totalPages ?? 0) - 3
                        ) {
                          // Last two pages
                          pageToShow = (users?.totalPages ?? 0) - 5 + index;
                        } else {
                          // Middle pages
                          pageToShow = (users?.pageNo ?? 0) - 2 + index;
                        }
                      }

                      // Only render if page is valid
                      if (
                        pageToShow >= 0 &&
                        pageToShow < (users?.totalPages ?? 0)
                      ) {
                        return (
                          <Button
                            key={pageToShow}
                            variant={
                              pageToShow === users?.pageNo
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => loadUsers({ pageNo: pageToShow })}
                            className="w-10 p-0"
                          >
                            {pageToShow + 1}
                          </Button>
                        );
                      }
                      return null;
                    }
                  )}

                  {/* Ellipsis if there are more pages */}
                  {(users?.totalPages ?? 0) > 5 &&
                    (users?.pageNo ?? 0) < (users?.totalPages ?? 0) - 3 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={
                    (users?.pageNo ?? 0) === (users?.totalPages ?? 0) - 1
                  }
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedUser && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
