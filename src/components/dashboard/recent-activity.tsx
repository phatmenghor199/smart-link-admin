"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/avatars/john-doe.png",
    },
    action: "logged in",
    timestamp: "2 minutes ago",
    type: "login",
  },
  {
    id: 2,
    user: {
      name: "Jane Smith",
      avatar: "/avatars/jane-smith.png",
    },
    action: "updated their profile",
    timestamp: "15 minutes ago",
    type: "update",
  },
  {
    id: 3,
    user: {
      name: "Bob Johnson",
      avatar: "/avatars/bob-johnson.png",
    },
    action: "upgraded to Pro plan",
    timestamp: "1 hour ago",
    type: "upgrade",
  },
  {
    id: 4,
    user: {
      name: "Alice Williams",
      avatar: "/avatars/alice-williams.png",
    },
    action: "created a new project",
    timestamp: "3 hours ago",
    type: "create",
  },
  {
    id: 5,
    user: {
      name: "Charlie Brown",
      avatar: "/avatars/charlie-brown.png",
    },
    action: "submitted a support ticket",
    timestamp: "5 hours ago",
    type: "support",
  },
  {
    id: 6,
    user: {
      name: "Diana Miller",
      avatar: "/avatars/diana-miller.png",
    },
    action: "added a new team member",
    timestamp: "1 day ago",
    type: "team",
  },
];

const getActivityIcon = (type: string) => {
  const iconClasses = "absolute h-2 w-2 rounded-full";

  switch (type) {
    case "login":
      return <span className={cn(iconClasses, "bg-green-500")} />;
    case "update":
      return <span className={cn(iconClasses, "bg-blue-500")} />;
    case "upgrade":
      return <span className={cn(iconClasses, "bg-purple-500")} />;
    case "create":
      return <span className={cn(iconClasses, "bg-yellow-500")} />;
    case "support":
      return <span className={cn(iconClasses, "bg-red-500")} />;
    case "team":
      return <span className={cn(iconClasses, "bg-indigo-500")} />;
    default:
      return <span className={cn(iconClasses, "bg-gray-500")} />;
  }
};

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <div className="relative mr-4">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={activity.user.avatar}
                alt={activity.user.name}
              />
              <AvatarFallback className="text-xs">
                {activity.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0">
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name}{" "}
              <span className="text-muted-foreground">{activity.action}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {activity.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
