import { Button, Text, colors } from "@/design-system";
import styled from "styled-components";
import type { ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { restoreSession } from "@/store/slices/authSlice";
const SessionCheck = styled.div`
  min-height: 100svh;
  display: grid;
  place-items: center;
  background: ${colors.background};
  color: ${colors.text};
`;

export default function SessionGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { sessionStatus, sessionError } = useAppSelector((state) => state.auth);

  if (sessionStatus === "idle" || sessionStatus === "loading") {
    return <SessionCheck role="status" aria-busy="true" aria-label="Checking your session">
      <Text>Checking your session…</Text>
    </SessionCheck>;
  }

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
