// Define possible filter statuses
export const USER_STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const USER_ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "DEVELOPER", label: "Developer" },
  // { value: "SHOP_ADMIN", label: "Shop Admin" },
];

export const SUBSCRIPTION_OPTIONS = [
  { value: "ALL", label: "All Subscriptions" },
  { value: "ACTIVE", label: "Active Subscriptions" },
  { value: "INACTIVE", label: "No Subscriptions" },
];

export const USER_ROLES = ["ADMIN", "SHOP_ADMIN", "DEVELOPER"] as const;

export const USER_STATUS = ["ACTIVE", "INACTIVE"] as const;

export const USER_ROLES_CREATE = ["ADMIN", "DEVELOPER"] as const;
