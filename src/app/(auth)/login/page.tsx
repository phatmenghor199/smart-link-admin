import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Next.js Dashboard",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
