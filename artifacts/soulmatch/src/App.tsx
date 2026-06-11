import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { PrivateRoute, AdminRoute } from "@/components/PrivateRoute";
import { getAccessToken } from "@/lib/auth-context";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import PricingPage from "@/pages/pricing";
import DashboardPage from "@/pages/dashboard";
import DiscoverPage from "@/pages/discover";
import MatchesPage from "@/pages/matches";
import ProfilePage from "@/pages/profile-self";
import UserProfilePage from "@/pages/profile-user";
import PreferencesPage from "@/pages/preferences";
import JourneyPage from "@/pages/journey";
import PersonalityPage from "@/pages/personality";
import InterestsPage from "@/pages/interests";
import ChatListPage from "@/pages/chat-list";
import ChatConversationPage from "@/pages/chat-conversation";
import NotificationsPage from "@/pages/notifications";
import SubscriptionPage from "@/pages/subscription";
import SettingsPage from "@/pages/settings";
import VerificationPage from "@/pages/verification";
import AdminDashboard from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminUserDetailPage from "@/pages/admin/user-detail";
import AdminReportsPage from "@/pages/admin/reports";
import AdminVerificationsPage from "@/pages/admin/verifications";
import AdminAnalyticsPage from "@/pages/admin/analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/pricing" component={PricingPage} />

      {/* Authenticated */}
      <Route path="/dashboard">
        <PrivateRoute component={DashboardPage} />
      </Route>
      <Route path="/discover">
        <PrivateRoute component={DiscoverPage} />
      </Route>
      <Route path="/matches">
        <PrivateRoute component={MatchesPage} />
      </Route>
      <Route path="/profile">
        <PrivateRoute component={ProfilePage} />
      </Route>
      <Route path="/profile/:userId">
        {(params) => <PrivateRoute component={() => <UserProfilePage userId={params.userId} />} />}
      </Route>
      <Route path="/preferences">
        <PrivateRoute component={PreferencesPage} />
      </Route>
      <Route path="/journey">
        <PrivateRoute component={JourneyPage} />
      </Route>
      <Route path="/personality">
        <PrivateRoute component={PersonalityPage} />
      </Route>
      <Route path="/interests">
        <PrivateRoute component={InterestsPage} />
      </Route>
      <Route path="/chat">
        <PrivateRoute component={ChatListPage} />
      </Route>
      <Route path="/chat/:conversationId">
        {(params) => <PrivateRoute component={() => <ChatConversationPage conversationId={params.conversationId} />} />}
      </Route>
      <Route path="/notifications">
        <PrivateRoute component={NotificationsPage} />
      </Route>
      <Route path="/subscription">
        <PrivateRoute component={SubscriptionPage} />
      </Route>
      <Route path="/settings">
        <PrivateRoute component={SettingsPage} />
      </Route>
      <Route path="/verification">
        <PrivateRoute component={VerificationPage} />
      </Route>

      {/* Admin */}
      <Route path="/admin">
        <AdminRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/users">
        <AdminRoute component={AdminUsersPage} />
      </Route>
      <Route path="/admin/users/:userId">
        {(params) => <AdminRoute component={() => <AdminUserDetailPage userId={params.userId} />} />}
      </Route>
      <Route path="/admin/reports">
        <AdminRoute component={AdminReportsPage} />
      </Route>
      <Route path="/admin/verifications">
        <AdminRoute component={AdminVerificationsPage} />
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute component={AdminAnalyticsPage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
