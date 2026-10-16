import { Button } from "@/design-system";
import type { ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { restoreSession } from "@/store/slices/authSlice";
import BootstrapSkeleton from "./BootstrapSkeleton";

export default function SessionGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { sessionStatus, sessionError } = useAppSelector((state) => state.auth);

  if (sessionStatus === "idle" || sessionStatus === "loading") return <BootstrapSkeleton />;

  if (sessionStatus === "failed") {
    return (
      <div role="alert">
        {sessionError}{" "}
        <Button variant="secondary" type="button" onClick={() => void dispatch(restoreSession())}>
          Retry
        </Button>
      </div>
    );
  }

  return children;
}
