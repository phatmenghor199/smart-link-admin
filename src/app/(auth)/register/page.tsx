import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Next.js Dashboard",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">
            Enter your information to get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
