import SettingsPage from "./pages/settings";
import { lazy, Suspense, useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import AppShell from "@/components/AppShell";
import AuthLayout from "@/components/AuthLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import SessionGate from "@/components/SessionGate";
import { preferencesApi } from "@/lib/preferences-api";
import { persistHomeCurrency } from "@/lib/preferences-storage";
import { persistTheme } from "@/lib/theme";
import LandingPage from "@/pages/landing";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeApp } from "@/store/bootstrap";
import { fetchDocuments } from "@/store/slices/documentsSlice";
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
const CoffeePackagesPage = lazy(() => import("@/pages/admin/packages"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const TrustPage = lazy(() => import("@/pages/trust"));
const WealthPage = lazy(() => import("@/pages/wealth"));

type LandingLocationState = {
  authMode?: "signin" | "signup";
  from?: { pathname?: string };
};

function LandingRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  const state = location.state as LandingLocationState | null;
  const authMode = state?.authMode === "signup" ? "signup" : state?.authMode === "signin" ? "signin" : null;
  const destination = state?.from?.pathname ?? "/home";

  if (token && user) {
    return <Navigate to={destination} replace />;
  }

  return <LandingPage initialAuthMode={authMode} onAuthed={() => navigate(destination, { replace: true })} />;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { token, user, initialized, initializationStatus, sessionStatus } = useAppSelector((state) => state.auth);
  const documentStatus = useAppSelector((state) => state.documents.status);
  const preferencesTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "idle") void dispatch(restoreSession());
  }, [dispatch, sessionStatus]);

  useEffect(() => {
    if (token && user?.pinConfigured && !initialized && initializationStatus === "idle") {
      void dispatch(initializeApp());
    }
  }, [dispatch, initializationStatus, initialized, token, user?.pinConfigured]);

  useEffect(() => {
    if (token && user?.pinConfigured && initialized) {
      void dispatch(fetchPackages({ limit: 20, page: 1 }));
    }
  }, [dispatch, initialized, token, user?.pinConfigured]);

  useEffect(() => {
    if (token && user?.pinConfigured && initialized && documentStatus === "idle") {
      void dispatch(fetchDocuments());
    }
  }, [dispatch, documentStatus, initialized, token, user?.pinConfigured]);

  useEffect(() => {
    if (!token || !user?.pinConfigured || !initialized || preferencesTokenRef.current === token) return;
    preferencesTokenRef.current = token;
    void preferencesApi.get().then((preferences) => {
      persistTheme(preferences.appearance);
      persistHomeCurrency(preferences.homeCurrency);
    }).catch(() => {
      preferencesTokenRef.current = null;
    });
  }, [initialized, token, user?.pinConfigured]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<SessionGate><LandingRoute /></SessionGate>} />
        <Route path="/landing" element={<SessionGate><LandingRoute /></SessionGate>} />
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

        <Route element={<SessionGate><ProtectedRoute /></SessionGate>}>
          <Route element={<AppShell />}>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/coffee/packages" element={<CoffeePackagesPage />} />
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
