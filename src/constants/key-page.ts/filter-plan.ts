// src/constants/filter-plan.ts

export const PLAN_STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const PLAN_TABLE_HEADER = [
  "ID",
  "Name",
  "Duration",
  "Price",
  "Max Products",
  "Status",
  "Created At",
  "Actions",
] as const;

export const PLAN_STATUSES = ["ACTIVE", "INACTIVE"] as const;
