import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import EarlyAccessLanding from "@/components/EarlyAccessLanding";

type LandingLocationState = {
  authMode?: "signin" | "signup";
  from?: { pathname?: string; search?: string; hash?: string };
};

export default function TempLandingRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  const state = location.state as LandingLocationState | null;
  const authMode = state?.authMode === "signup" ? "signup" : state?.authMode === "signin" ? "signin" : null;
  const returnLocation = state?.from;
  const destination = returnLocation?.pathname?.startsWith("/") && !returnLocation.pathname.startsWith("//")
    ? `${returnLocation.pathname}${returnLocation.search ?? ""}${returnLocation.hash ?? ""}`
    : "/home";

  // Explicit login/signup navigation is a one-time action, not persistent
  // landing-page state that should reopen the dialog on refresh or Back.
  useEffect(() => {
    if (!authMode || (token && user)) return;
    const { authMode: consumed, ...remaining } = state ?? {};
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: remaining,
    });
  }, [authMode, location.hash, location.pathname, location.search, navigate, state, token, user]);

  if (token && user) {
    return <Navigate to={destination} replace />;
  }

  return <EarlyAccessLanding initialAuthMode={authMode} onAuthed={() => navigate(destination, { replace: true })} />;
}

