"use client";

import React from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 right-4  z-50">
        <ThemeToggle />
      </div>
      <div className="absolute h-full w-full bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
