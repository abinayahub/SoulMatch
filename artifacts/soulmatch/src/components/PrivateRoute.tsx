import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import type { ComponentType } from "react";
import AdminLayout from "./admin/AdminLayout";

interface PrivateRouteProps {
  component: ComponentType;
}

export function PrivateRoute({ component: Component }: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Redirect to="/login" />;

  // Force users to complete the 30-day journey before accessing the rest of the app
  const [location] = useLocation();
  const isJourneyPage = location.startsWith("/journey");
  const isDashboardPage = location === "/dashboard";
  const isDiscoverPage = location === "/discover";
  const isPricingPage = location === "/pricing";
  const isProfileSetup = location === "/profile" || location === "/settings";
  const isMyStoryPage = location === "/my-story";
  const isStoryArchivePage = location === "/story-archive";
  const isChatPage = location.startsWith("/chat");
  const isNotificationsPage = location === "/notifications";
  const isInterestsPage = location === "/interests";
  const isMatchesPage = location === "/matches";
  const isUserProfilePage = location.startsWith("/profile/");
  const isSupportPage = location === "/support";
  const isReflectionPage = location === "/reflection";
  const isActivityPage = location === "/activity";
  const isCheckoutPage = location.startsWith("/checkout");
  const questionsNeeded = 150; // 30 days * 5 questions
  
  if (user && user.journeyProgress < questionsNeeded && !isReflectionPage && !isSupportPage && !isJourneyPage && !isProfileSetup && !isDashboardPage && !isDiscoverPage && !isPricingPage && !isMyStoryPage && !isStoryArchivePage && !isChatPage && !isNotificationsPage && !isInterestsPage && !isMatchesPage && !isUserProfilePage && !isActivityPage && !isCheckoutPage) {
    return <Redirect to="/dashboard" />;
  }

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
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}
