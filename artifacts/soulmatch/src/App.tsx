import { Switch, Route, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PrivateRoute, AdminRoute } from "@/components/PrivateRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { getAccessToken } from "@/lib/auth-context";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import RegistrationSuccessPage from "@/pages/registration-success";
import CompleteProfilePage from "@/pages/complete-profile";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import PricingPage from "@/pages/pricing";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import DashboardPage from "@/pages/dashboard";
import DiscoverPage from "@/pages/discover";
import MatchesPage from "@/pages/matches";
import ProfilePage from "@/pages/profile-self";
import UserProfilePage from "@/pages/profile-user";
import PreferencesPage from "@/pages/preferences";
import JourneyPage from "@/pages/journey";
import MyStoryPage from "@/pages/my-story";
import StoryArchivePage from "@/pages/story-archive";
import CommunityQuestionsPage from "@/pages/community-questions";
import AskCommunityQuestionPage from "@/pages/ask-community-question";
import BrowseQuestionsPage from "@/pages/browse-questions";
import AnswerCommunityQuestionPage from "@/pages/answer-community-question";
import QuestionResponsesPage from "@/pages/question-responses";
import MyAnswerPage from "@/pages/my-answer";
import PersonalityPage from "@/pages/personality";
import ReflectionPage from "@/pages/reflection";
import InterestsPage from "@/pages/interests";
import MyNotesPage from "@/pages/my-notes";
import ChatListPage from "@/pages/chat-list";
import ChatConversationPage from "@/pages/chat-conversation";
import NotificationsPage from "@/pages/notifications";
import SubscriptionPage from "@/pages/subscription";
import SettingsPage from "@/pages/settings";
import ActivityPage from "@/pages/activity";
import VerificationPage from "@/pages/verification";
import ContactSupportPage from "@/pages/contact-support";
import AdminOverview from "@/pages/admin/Overview";
import AdminUserManagement from "@/pages/admin/UserManagement";
import AdminQuestionnaireManager from "@/pages/admin/QuestionnaireManager";
import MatchesManagement from "@/pages/admin/MatchesManagement";
import JournalsManagement from "@/pages/admin/JournalsManagement";
import AdminCommunityQuestionsManager from "@/pages/admin/CommunityQuestionsManager";
import AdminComingSoon from "@/pages/admin/ComingSoon";
import SuperAdmin from "@/pages/admin/SuperAdmin";
import AdminSupport from "@/pages/admin/Support";
import PremiumManagement from "@/pages/admin/PremiumManagement";
import CheckoutCompatibilityPage from "@/pages/checkout-compatibility";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 120_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/">
        <PublicRoute component={LandingPage} />
      </Route>
      <Route path="/login">
        <PublicRoute component={LoginPage} />
      </Route>
      <Route path="/register">
        <PublicRoute component={RegisterPage} />
      </Route>
      <Route path="/registration-success">
        <PrivateRoute component={RegistrationSuccessPage} />
      </Route>
      <Route path="/complete-profile" component={CompleteProfilePage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />

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
      <Route path="/checkout/compatibility">
        <PrivateRoute component={CheckoutCompatibilityPage} />
      </Route>
      <Route path="/preferences">
        <PrivateRoute component={PreferencesPage} />
      </Route>
      <Route path="/journey">
        <PrivateRoute component={JourneyPage} />
      </Route>
      <Route path="/reflection">
        <PrivateRoute component={ReflectionPage} />
      </Route>
      <Route path="/my-story">
        <PrivateRoute component={MyStoryPage} />
      </Route>
      <Route path="/community-questions">
        <PrivateRoute component={CommunityQuestionsPage} />
      </Route>
      <Route path="/ask-community-question">
        <PrivateRoute component={AskCommunityQuestionPage} />
      </Route>
      <Route path="/browse-questions">
        <PrivateRoute component={BrowseQuestionsPage} />
      </Route>
      <Route path="/community-questions/:id/answer">
        {(params) => <PrivateRoute component={() => <AnswerCommunityQuestionPage questionId={params.id} />} />}
      </Route>
      <Route path="/community-questions/:id/responses">
        {(params) => <PrivateRoute component={() => <QuestionResponsesPage questionId={params.id} />} />}
      </Route>
      <Route path="/community-questions/my-answers/:id">
        {(params) => <PrivateRoute component={() => <MyAnswerPage answerId={params.id} />} />}
      </Route>
      <Route path="/story-archive">
        <PrivateRoute component={StoryArchivePage} />
      </Route>
      <Route path="/personality">
        <PrivateRoute component={PersonalityPage} />
      </Route>
      <Route path="/interests">
        <PrivateRoute component={InterestsPage} />
      </Route>
      <Route path="/notes">
        <PrivateRoute component={MyNotesPage} />
      </Route>
      <Route path="/chat">
        <PrivateRoute component={ChatListPage} />
      </Route>
      <Route path="/chat/:id">
        <PrivateRoute component={ChatConversationPage} />
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
      <Route path="/activity">
        <PrivateRoute component={ActivityPage} />
      </Route>
      <Route path="/verification">
        <PrivateRoute component={VerificationPage} />
      </Route>
      <Route path="/support">
        <PrivateRoute component={ContactSupportPage} />
      </Route>

      {/* Admin */}
      <Route path="/admin">
        <AdminRoute component={AdminOverview} />
      </Route>
      <Route path="/admin/users">
        <AdminRoute component={AdminUserManagement} />
      </Route>
      <Route path="/admin/questions">
        <AdminRoute component={AdminQuestionnaireManager} />
      </Route>
      <Route path="/admin/matches">
        <AdminRoute component={MatchesManagement} />
      </Route>
      <Route path="/admin/journals">
        <AdminRoute component={JournalsManagement} />
      </Route>
      <Route path="/admin/community-questions">
        <AdminRoute component={AdminCommunityQuestionsManager} />
      </Route>
      <Route path="/admin/premium">
        <AdminRoute component={PremiumManagement} />
      </Route>
      <Route path="/admin/verifications">
        <AdminRoute component={() => <AdminComingSoon title="Verification Center" />} />
      </Route>
      <Route path="/admin/reports">
        <AdminRoute component={() => <AdminComingSoon title="Reports & Safety" />} />
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute component={() => <AdminComingSoon title="Analytics Dashboard" />} />
      </Route>
      <Route path="/admin/support">
        <AdminRoute component={AdminSupport} />
      </Route>
      <Route path="/admin/notifications">
        <AdminRoute component={() => <AdminComingSoon title="Notification Management" />} />
      </Route>
      <Route path="/admin/content">
        <AdminRoute component={() => <AdminComingSoon title="Content Management" />} />
      </Route>
      <Route path="/admin/settings">
        <AdminRoute component={() => <AdminComingSoon title="Platform Settings" />} />
      </Route>
      <Route path="/admin/super">
        <AdminRoute component={SuperAdmin} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "123456789-mock-client-id.apps.googleusercontent.com";

function ThemeManager() {
  const { user } = useAuth();
  
  useEffect(() => {
    const savedTheme = user ? (localStorage.getItem(`theme_${user.id}`) || localStorage.getItem('theme')) : localStorage.getItem('theme');
    const activeTheme = savedTheme || 'dark';
    
    document.documentElement.classList.remove('light', 'dark', 'purple');
    
    if (activeTheme === 'light') {
      document.documentElement.classList.add('light');
    } else if (activeTheme === 'purple') {
      document.documentElement.classList.add('dark', 'purple');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [user]);

  return null;
}

function App() {
  useEffect(() => {
    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const path = window.location.pathname;
      if (path === '/' || path === '/dashboard' || path === '/login') {
        CapacitorApp.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      listener.then(l => l.remove()).catch(() => {});
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeManager />
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
