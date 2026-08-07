import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AppShell from "@/components/AppShell";
import AuthLayout from "@/components/AuthLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import BootstrapSkeleton from "@/components/BootstrapSkeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeApp } from "@/store/bootstrap";
import { fetchPackages } from "@/store/slices/packagesSlice";

const DocumentsPage = lazy(() => import("@/pages/documents"));
const FamilyPage = lazy(() => import("@/pages/family"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const HealthPage = lazy(() => import("@/pages/health"));
const HomePage = lazy(() => import("@/pages/home"));
const LandingPage = lazy(() => import("@/pages/landing"));
const LegacyPage = lazy(() => import("@/pages/legacy"));
const LoginPage = lazy(() => import("@/pages/login"));
const PackagesPage = lazy(() => import("@/pages/packages"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const SignupPage = lazy(() => import("@/pages/signup"));
const TrustPage = lazy(() => import("@/pages/trust"));
const WealthPage = lazy(() => import("@/pages/wealth"));

function LandingRoute() {
  const navigate = useNavigate();
  const { token, user, initialized } = useAppSelector((state) => state.auth);

  if (token && user) {
    if (!initialized) return <BootstrapSkeleton />;
    return (
      <AppShell>
        <HomePage />
      </AppShell>
    );
  }

  return <LandingPage onStart={() => navigate("/login")} />;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { token, initialized, initializationStatus } = useAppSelector((state) => state.auth);

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
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          }
        />
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

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
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
