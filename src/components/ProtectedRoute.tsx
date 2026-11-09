import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { acknowledgeInitializationFailure } from "@/store/slices/authSlice";
import BootstrapSkeleton from "./BootstrapSkeleton";
import PinSetupGate from "./PinSetupGate";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, user, status, initialized, initializationStatus } =
    useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initializationStatus === "failed" && location.pathname === "/home") {
      dispatch(acknowledgeInitializationFailure());
    }
  }, [dispatch, initializationStatus, location.pathname]);

  if (!token || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!user.pinConfigured) return <PinSetupGate />;

  if (initializationStatus === "failed") {
    return location.pathname === "/home" ? <Outlet /> : <Navigate to="/home" replace />;
  }

  if (!initialized && (status === "loading" || initializationStatus === "loading" || initializationStatus === "idle")) {
    return <BootstrapSkeleton />;
  }

  return <Outlet />;
}
