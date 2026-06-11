import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth-context";
import type { ComponentType } from "react";

interface PrivateRouteProps {
  component: ComponentType;
}

export function PrivateRoute({ component: Component }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

interface AdminRouteProps {
  component: ComponentType;
}

export function AdminRoute({ component: Component }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/dashboard" />;
  return <Component />;
}
