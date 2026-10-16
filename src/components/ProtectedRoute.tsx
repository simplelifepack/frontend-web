import { Button } from "@/design-system";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeApp } from "@/store/bootstrap";
import BootstrapSkeleton from "./BootstrapSkeleton";
import PinSetupGate from "./PinSetupGate";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, user, status, initialized, initializationStatus, initializationError } =
    useAppSelector((state) => state.auth);

  if (token && user && !user.pinConfigured) return <PinSetupGate />;

  if (token && (!initialized || !user) && (status === "loading" || initializationStatus === "loading" || initializationStatus === "idle")) {
    return <BootstrapSkeleton />;
  }

  if (token && initializationStatus === "failed") {
    return (
      <div role="alert">
        {initializationError ?? "Unable to initialize Readiness."}{" "}
        <Button variant="secondary" type="button" onClick={() => void dispatch(initializeApp())}>
          Retry
        </Button>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/" replace state={{ authMode: "signin", from: location }} />;
  }

  return <Outlet />;
}
