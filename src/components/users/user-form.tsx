"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { EnhancedUser } from "@/models/user/user-profile.model";

export interface UserFormProps {
  user?: EnhancedUser;
  onSubmit: (data: Partial<EnhancedUser>) => Promise<void>;
  onCancel: () => void;
}

const formSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  userRole: z.enum(["DEVELOPER", "SHOP_ADMIN", "USER"]),
});

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Partial<EnhancedUser>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      userRole: user?.userRole || "USER",
    },
  });

  const handleFormSubmit = async (data: Partial<EnhancedUser>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Email</Label>
          <Input
            id="username"
            placeholder="user@example.com"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userRole">User Role</Label>
          <Select
            defaultValue={user?.userRole || "USER"}
            onValueChange={(value) =>
              setValue("userRole", value as "DEVELOPER" | "SHOP_ADMIN" | "USER")
            }
          >
            <SelectTrigger id="userRole">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEVELOPER">Developer</SelectItem>
              <SelectItem value="SHOP_ADMIN">Shop Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>
          {errors.userRole && (
            <p className="text-sm text-red-500">{errors.userRole.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {user ? "Updating..." : "Creating..."}
            </>
          ) : user ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  );
}
