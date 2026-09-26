import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeApp } from "@/store/bootstrap";
import { restoreSession } from "@/store/slices/authSlice";
import BootstrapSkeleton from "./BootstrapSkeleton";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, user, status, initialized, initializationStatus, initializationError, sessionStatus } =
    useAppSelector((state) => state.auth);

  useEffect(() => {
    if (sessionStatus === "idle") void dispatch(restoreSession());
  }, [dispatch, sessionStatus]);

  if (sessionStatus === "idle" || sessionStatus === "loading") return <BootstrapSkeleton />;

  if (token && (!initialized || !user) && (status === "loading" || initializationStatus === "loading" || initializationStatus === "idle")) {
    return <BootstrapSkeleton />;
  }

  if (token && initializationStatus === "failed") {
    return (
      <div role="alert">
        {initializationError ?? "Unable to initialize Readiness."}{" "}
        <button type="button" onClick={() => void dispatch(initializeApp())}>
          Retry
        </button>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/" replace state={{ authMode: "signin", from: location }} />;
  }

  return <Outlet />;
}
