import SettingsPage from "./pages/settings";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import AppShell from "@/components/AppShell";
import AuthLayout from "@/components/AuthLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import BootstrapSkeleton from "@/components/BootstrapSkeleton";
import LandingPage from "@/pages/landing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeApp } from "@/store/bootstrap";
import { fetchPackages } from "@/store/slices/packagesSlice";
import { restoreSession } from "@/store/slices/authSlice";

const DocumentsPage = lazy(() => import("@/pages/documents"));
const FamilyPage = lazy(() => import("@/pages/family"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const HealthPage = lazy(() => import("@/pages/health"));
const HomePage = lazy(() => import("@/pages/home"));
const InvitePage = lazy(() => import("@/pages/invite"));
const LegacyPage = lazy(() => import("@/pages/legacy"));
const PackagesPage = lazy(() => import("@/pages/packages"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const TrustPage = lazy(() => import("@/pages/trust"));
const WealthPage = lazy(() => import("@/pages/wealth"));

const publicEntryPaths = new Set([
  "/",
  "/landing",
  "/login",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
]);

type LandingLocationState = {
  authMode?: "signin" | "signup";
  from?: { pathname?: string };
};

function LandingRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, initialized } = useAppSelector((state) => state.auth);
  const state = location.state as LandingLocationState | null;
  const authMode = state?.authMode === "signup" ? "signup" : state?.authMode === "signin" ? "signin" : null;
  const destination = state?.from?.pathname ?? "/home";

  if (token && user) {
    if (!initialized) return <BootstrapSkeleton />;
    return (
      <AppShell>
        <HomePage />
      </AppShell>
    );
  }

  return <LandingPage initialAuthMode={authMode} onAuthed={() => navigate(destination, { replace: true })} />;
}

export default function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, initialized, initializationStatus, sessionStatus } = useAppSelector((state) => state.auth);
  const isPublicEntryPath = publicEntryPaths.has(location.pathname) || location.pathname.startsWith("/invite/");

  useEffect(() => {
    if (!isPublicEntryPath && sessionStatus === "idle") void dispatch(restoreSession());
  }, [dispatch, isPublicEntryPath, sessionStatus]);

  useEffect(() => {
    if (token && !initialized && initializationStatus === "idle") {
      void dispatch(initializeApp());
    }
  }, [dispatch, initializationStatus, initialized, token]);

  useEffect(() => {
    if (token && initialized) {
      void dispatch(fetchPackages({ limit: 20, page: 1 }));
    }
  }, [dispatch, initialized, token]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/landing" element={<LandingRoute />} />
        <Route path="/login" element={<Navigate to="/" replace state={{ authMode: "signin" }} />} />
        <Route path="/signin" element={<Navigate to="/" replace state={{ authMode: "signin" }} />} />
        <Route path="/signup" element={<Navigate to="/" replace state={{ authMode: "signup" }} />} />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPasswordPage />
            </AuthLayout>
          }
        />
        <Route
          path="/invite/:token"
          element={
            <AuthLayout>
              <InvitePage />
            </AuthLayout>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:category" element={<DocumentsPage />} />
            <Route
              path="/documents/:category/:documentId"
              element={<DocumentsPage />}
            />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/wealth" element={<WealthPage />} />
            <Route path="/legacy" element={<LegacyPage />} />
            <Route path="/trust" element={<TrustPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
