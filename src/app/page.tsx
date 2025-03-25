"use client";

export default function HomePage() {
  // Show a loading state while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-primary" />
    </div>
  );
}
